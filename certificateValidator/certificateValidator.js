var aws = require("aws-sdk");
aws.config.update({region: "us-east-1"}); // as cloudfront uses certificates imported from us-east-1 region only
var response = require("cfn-response");
var acm = new aws.ACM({apiVersion: "latest"});

function wait(ms) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}

function triggerLambdaFunction(event, context, callback) {
    aws.config.update({region: event.ResourceProperties.Region});
    console.log("event within trigger ==> " + JSON.stringify(event, null, 4));
    var lambda = new aws.Lambda({apiVersion: "2015-03-31"});
    var params = {
        FunctionName: event.ResourceProperties.LambdaArn /* required */,
        InvocationType: "Event",
        Payload: JSON.stringify(event)
    };
    lambda.invoke(params, function (err, data) {
        if (err) {
            console.log(
                "error occured in lambda trigger ==> " + JSON.stringify(err, null, 4)
            );
            response.send(event, context, callback, response.FAILED, {
                Error: err.message
            });
        }
    });
}

function moreThanThresholdSec(startTime) {
    const endTime = new Date().getTime() / 1000;
    const totalExecutionTime = endTime - startTime;
    const executionThreshold = process.env.EXEC_THRESHOLD_SECONDS;
    return totalExecutionTime > parseInt(executionThreshold);
}

function createCertificate(event, context, callback) {
    try {
        if (event.RequestType == "Delete") {
            var params = {
                CertificateArn: event.PhysicalResourceId
            };
            acm.deleteCertificate(params, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                    response.send(event, context, callback, response.FAILED, {
                        Error: err.message
                    });
                } else {
                    response.send(event, context, callback, response.SUCCESS);
                }
            });
            return;
        } else if (event.RequestType == "Create") {
            var nameServers = []
            for (var i = 0; i < event.ResourceProperties.NameServers.length; i++) {
                nameServers.push({
                    Name: event.ResourceProperties.NameServers[i],
                })
            }
            var paramsDomain = {
                DomainName: event.ResourceProperties.DomainName, /* required */
                Nameservers: nameServers
            };
            var route53domains = new aws.Route53Domains();
            route53domains.updateDomainNameservers(paramsDomain, function (errDomain, data) {
                if (errDomain) {
                    response.send(event, context, callback, response.FAILED, {
                        Error: errDomain.message
                    });
                } else {
                    var params = {
                        DomainName: event.ResourceProperties.DomainName,
                        ValidationMethod: event.ResourceProperties.ValidationMethod,
                        SubjectAlternativeNames: ["www." + event.ResourceProperties.DomainName],
                    };
                    acm.requestCertificate(params, function (err, data) {
                        if (err) {
                            response.send(event, context, callback, response.FAILED, {
                                Error: err.message
                            });
                        } else {
                            var responseData = {
                                CertificateArn: data.CertificateArn
                            };
                            wait(10000); // it's hack to avoid immediate calling of acm.describeCertificate just after the certificate is created.
                            response.send(
                                event,
                                context,
                                callback,
                                response.SUCCESS,
                                responseData,
                                data.CertificateArn
                            );
                        }
                    });
                }
            });
        } else {
            response.send(event, context, callback, response.SUCCESS);
        }
    } catch (err) {
        console.log("error ===> " + JSON.stringify(err, null, 4));
        response.send(event, context, callback, response.FAILED, {
            Error: err.message
        });
    }
}

function certificateDNSRecord(event, context, callback) {
    try {
        if (event.RequestType == "Create") {
            var certificateArn = event.ResourceProperties.CertificateArn;
            var params = {
                CertificateArn: certificateArn
            };
            acm.describeCertificate(params, function(err1, data1) {
                if (err1) {
                    response.send(event, context, response.FAILED, {
                        Error: err1.message
                    });
                } else {
                    var validationRecord1 =
                        data1.Certificate.DomainValidationOptions[0].ResourceRecord;
                    var validationRecord2 =
                        data1.Certificate.DomainValidationOptions[1].ResourceRecord;
                    var certificateId = certificateArn.split("/")[1];
                    var responseData = {
                        CertificateArn: certificateArn,
                        CertificateId: certificateId,
                        Name1: validationRecord1.Name,
                        Value1: validationRecord1.Value,
                        Name2: validationRecord2.Name,
                        Value2: validationRecord2.Value
                    };
                    response.send(
                        event,
                        context,
                        callback,
                        response.SUCCESS,
                        responseData,
                        certificateArn
                    );
                }
            });
        } else {
            response.send(event, context, callback, response.SUCCESS);
        }
    } catch (err) {
        console.log("error ===> " + JSON.stringify(err, null, 4));
        response.send(event, context, callback, response.FAILED, {
            Error: err.message
        });
    }
}

function certificateValidityStatus(event, context, callback, startTime) {
    try {
        if (event.RequestType == "Create") {
            var certificateArn = event.ResourceProperties.CertificateArn;
            var params = {
                CertificateArn: certificateArn
            };
            acm.describeCertificate(params, function (err1, data1) {
                if (err1) {
                    response.send(event, context, callback, response.FAILED, {
                        Error: err1.message
                    });
                } else {
                    if (data1.Certificate.Status === "ISSUED") {
                        console.log("certificate got validated!!!!");
                        var responseData = {
                            CertificateArn: certificateArn
                        };
                        response.send(
                            event,
                            context,
                            callback,
                            response.SUCCESS,
                            responseData,
                            certificateArn
                        );
                    } else {
                        if (moreThanThresholdSec(startTime)) {
                            triggerLambdaFunction(event, context, callback);
                        } else {
                            wait(60000);
                            if (moreThanThresholdSec(startTime)) {
                                triggerLambdaFunction(event, context, callback);
                            } else {
                                console.log("certificateValidityStatus calling self");
                                certificateValidityStatus(event, context, callback, startTime);
                            }
                        }
                    }
                }
            });
        } else {
            response.send(event, context, callback, response.SUCCESS);
        }
    } catch (err) {
        console.log("error ===> " + JSON.stringify(err, null, 4));
        response.send(event, context, callback, response.FAILED, {
            Error: err.message
        });
    }
}

/*function certificateValidityStatus(event, context, callback, startTime) {
  try {
    if (event.RequestType == "Create") {
      var certificateArn = event.ResourceProperties.CertificateArn;
      var params = {
        CertificateArn: certificateArn
      };
      acm.describeCertificate(params, function(err1, data1) {
        if (err1) {
          response.send(event, context, callback, response.FAILED, {
            Error: err1.message
          });
        } else {
          console.log(
            "this is issue data ==> " + JSON.stringify(data1, null, 4)
          );
          if (data1.Certificate.Status === "ISSUED") {
            console.log("certificate got validated!!!!");
            var responseData = {
              CertificateArn: certificateArn
            };
            response.send(
              event,
              context,
              callback,
              response.SUCCESS,
              responseData,
              certificateArn
            );
          } else {
            //wait(60000);
            console.log(
              "******************calling triggerLambdaFunction***************"
            );
            triggerLambdaFunction(event, context, callback);
          }
        }
      });
    } else {
      response.send(event, context, callback, response.SUCCESS);
    }
  } catch (err) {
    console.log("error ===> " + JSON.stringify(err, null, 4));
    response.send(event, context, callback, response.FAILED, {
      Error: err.message
    });
  }
} */

exports.handler = function (event, context, callback) {
    console.log(JSON.stringify("event ==> " + JSON.stringify(event, null, 4)));
    if (event.ResourceType === "Custom::Certificate") {
        createCertificate(event, context, callback);
    } else if (event.ResourceType === "Custom::CertificateDNSRecord") {
        certificateDNSRecord(event, context, callback);
    } else {
        var startTime = new Date().getTime() / 1000;
        certificateValidityStatus(event, context, callback, startTime);
    }
};
