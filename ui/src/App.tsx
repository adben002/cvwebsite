import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Card} from "react-bootstrap";
import './App.css';

type YearObject = {
    from: Date,
    to?: Date
}

type JobInfo = {
    role: string
    place: string,
    placeUrl: string,
    range: YearObject,
    technicalScope: string,
    details: string,
    keyContributions: string[]
}

function formatZeroIndexedDate(day: number, month: number, year: number) {
    return new Date(year, month - 1, day);
}

const jobs: JobInfo[] = [
    {
        "role": "Full stack software engineer",
        "place": "Jisc",
        "placeUrl": "https://www.jisc.ac.uk/",
        range: {
            "from": formatZeroIndexedDate(15, 6, 2018)
        },
        technicalScope: "Java, Google Cloud, GWT",
        details: `
            Developed and maintained custom applications, web applications and APIs utilising google cloud platform.
        `,
        keyContributions: [
            "Developed and deployed google cloud function to transform large CSV files.",
            "Developed new features for a custom application utilising SAML integration and GWT.",
            "Implemented integration with seamless access iframe, while addressing web security concerns.",
            "Uplifted Node.js google cloud function to Node.js 10."
        ]
    },
    {
        "role": "Contract Software Engineer",
        "place": "Royal Bank of Scotland (RBS)",
        "placeUrl": "https://www.business.rbs.co.uk/business/ways-to-bank/bankline.html",
        range: {
            "from": formatZeroIndexedDate(4, 6, 2018),
            "to": formatZeroIndexedDate(9, 6, 2020)
        },
        technicalScope: "Java, Kotlin, DB2",
        details: `
            Analyse, design, develop, configure, test, and debug software/application enhancements and new
            implementations. Apply industry-standard technologies; and implement high-quality solutions
            aligned with business needs and specifications. Collaborate with cross-functional teams, creating a
            DB2 database for confirmation of payee checks; and manage third-party service, ensuring alignment
            with API requirements. Gather requirements, translating requirements into technical solutions.
        `,
        keyContributions: [
            "Architected, designed and implemented new Kotlin confirmation of payee microservice for New Bankline, supporting 15K concurrent payments.",
            "Led Cucumber features addition project, conducting acceptance tests on Java and Kotlin microservices."
        ]
    },
    {
        "role": "Senior Developer",
        "place": "Scott Logic",
        "placeUrl": "http://www.scottlogic.com/",
        range: {
            "from": formatZeroIndexedDate(1, 4, 2017),
            "to": formatZeroIndexedDate(4, 6, 2018)
        },
        technicalScope: "Hibernate, Test Data Generation Library",
        details: `
            Developed and maintained custom applications, web applications and APIs, integrating custom
            platforms with third-party systems. Owned solution design and architectural decisions; and resolve
            code issues, troubleshooting and determining the root cause.
        `,
        keyContributions: [
            "Developed open-source Java library for POJO and test data generation for Hibernate, publishing process to maven central.",
            "Led active savings project in an Agile environment for Hargreaves Lansdown, enhancing bank processes for opening bank accounts and transferring funds."
        ]
    },
    {
        "role": "Senior Developer",
        "place": "Information Processing Limited (IPL)",
        "placeUrl": "https://www.civica.com/en-GB/civica-digital/",
        range: {
            "from": formatZeroIndexedDate(1, 10, 2015),
            "to": formatZeroIndexedDate(1, 4, 2017)
        },
        technicalScope: "MySQL DB, Java, Spring Batch, Lucene, XML, Selenide, PhantomJS, AWS S3, AngularJs",
        details: `
            Directed and mentored development teams in Poland and the United Kingdom, performing code
            reviews and providing technical leadership. Produced technical documentation; and owned design
            and implementation projects, building code structure and design.
        `,
        keyContributions: [
            "Developed and maintained parallel spring batch process to export timeline data from multiple database tables, publishing files to AWS S3 buckets and sending SQS messages.",
            "Implemented inbound interface to receive files comprising 22 million XML records, and translated data into a system database.",
            "Served as Joint Technical Lead, leading RSP sub-project providing inbound/outbound interfaces; and presented the design and implementation features to Service Team.",
            "Optimised and enhanced performance of complex algorithms; and implemented validation tools for migrated data and framework.",
            "Continued as Senior Developer and Joint Technical Lead following IPL merger with Civica Digital in 2017."
        ]
    },
    {
        "role": "Developer",
        "place": "Information Processing Limited (IPL)",
        "placeUrl": "http://www.ipl.com/",
        range: {
            "from": formatZeroIndexedDate(1, 7, 2013),
            "to": formatZeroIndexedDate(1, 10, 2015)
        },
        technicalScope: "MySQL, Hibernate, Spring MVC, JSP, jQuery",
        details: `
            Developed full-stack web applications, collaborating with cross-functional teams to gather
            requirements and feature specifications. Delivered bug-free code in-line with development sprints;
            and wrote tests.
        `,
        keyContributions: [
            "Performed CRUD and search operations for millions of information records."
        ]
    }
];

function formatDate(date: Date | undefined) {

    if (!date) {
        return 'Present'
    }

    // Create a list of names for the months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // return a formatted date
    return months[date.getMonth()] + '-' + date.getFullYear();

}


function App() {
    return (
        <Container>

            <Row className={"border-bottom"}>
                <Col xs={12}>
                    <h1 className={"mt-5"}>Adam Bennett</h1>
                </Col>
                <Col xs={12}>
                    <h5>
                        Senior Full-Stack Web Developer -
                        <a className={"ml-1"} href={"mailto:adben002@gmail.com"}>adben002@gmail.com</a>
                    </h5>
                </Col>
            </Row>

            <Row className={"mt-4"}>
                <Col xs={12}>
                    <h5>{`8+ years' in owning day-to-day platform performance and bug fixes.`}</h5>
                </Col>
            </Row>

            <Row className={"mt-4"}>
                <Col xs={12}>
                    <h3>
                        <FontAwesomeIcon icon={['fas', 'bookmark']} className={"mr-2"}/>
                        Profile
                    </h3>
                </Col>
            </Row>

            <Row>
                <Col
                    xs={12}> {` Full-stack development professional with a passion for new technologies and improving processes.
                            Experience with an Agile environment and understanding of requirements to develop them into
                            working features. Comprehensive knowledge of business and technical requirements to drive
                            technological development. Strong organisational and project management skills, leveraging
                            strengths in team leadership, cross-team collaboration, and stakeholder communication.`
                }
                </Col>
            </Row>

            <Row>
                <Col xs={2}/>
                <Col className={"text-center pt-3 pb-3"}
                     xs={8}> <i>{` Software Engineering / Web Development / Application Modernization / Agile Environment
                            System Architecture Design and Implementation / Root Cause Analysis / Project Management`
                }</i>
                </Col>
                <Col xs={2}/>
            </Row>

            <Row className={"mt-4"}>
                <Col xs={12}>
                    <h3>
                        <FontAwesomeIcon icon={['fas', 'cogs']} className={"mr-2"}/>
                        Technical
                    </h3>
                </Col>
            </Row>
            <Row className={"pl-5 pr-5"}>
                <Col xs={4} className={"App-Item"}>Java</Col>
                <Col xs={4} className={"App-Item"}>API Design</Col>
                <Col xs={4} className={"App-Item"}>Database Delivery</Col>
                <Col xs={4} className={"App-Item"}>Agile Delivery</Col>
                <Col xs={4} className={"App-Item"}>Microservice Architecture</Col>
                <Col xs={4} className={"App-Item"}>Spring 3+</Col>
                <Col xs={4} className={"App-Item"}>Git</Col>
                <Col xs={4} className={"App-Item"}>SQL (Oracle, DB2, MySQL)</Col>
                <Col xs={4} className={"App-Item"}>Kotlin</Col>
                <Col xs={4} className={"App-Item"}>Hibernate/JPA</Col>
                <Col xs={4} className={"App-Item"}>Amazon Web Services (AWS)</Col>
                <Col xs={4} className={"App-Item"}>React</Col>
                <Col xs={4} className={"App-Item"}>Lucene</Col>
                <Col xs={4} className={"App-Item"}>Python</Col>
                <Col xs={4} className={"App-Item"}>Selenium</Col>
                <Col xs={4} className={"App-Item"}>Maven</Col>
                <Col xs={4} className={"App-Item"}>BASH</Col>
            </Row>
            <Row className={"mt-4"}>
                <Col xs={12}>
                    <h3>
                        <FontAwesomeIcon icon={['fas', 'briefcase']} className={"mr-3"}/>
                        Experience
                    </h3>
                </Col>
            </Row>
            {jobs.map((value, index) =>
                <Col xs={12} className={"mt-2"} key={index}>
                    <Card>
                        <Card.Header as={"h4"} className={"bg-info text-white"}>
                            {value.role}
                        </Card.Header>

                        <Card.Body>
                            <span>
                                <strong>
                                  <a target={"_blank"} rel="noopener noreferrer"
                                     href={value.placeUrl} className={"mr-1"}>{value.place}</a>
                                </strong>
                            </span>
                            <span
                                className="text-grey-color">({formatDate(value.range.from)} to {formatDate(value.range.to)})</span>
                            <div className="pt-1 pb-1 pl-1 pr-1">
                                <i>Technical Scope: {value.technicalScope}</i>
                            </div>
                            <div className="pt-1 pb-2 pl-1 pr-1">
                                {value.details}
                            </div>
                            <ul>
                                {value.keyContributions.map((x, i) =>
                                    <li key={i}>{x}</li>
                                )}
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            )}


            <Row className={"mt-4 no-print"}>
                <Col xs={12}>
                    <h3>
                        <FontAwesomeIcon icon={['fas', 'graduation-cap']} className={"mr-3"}/>
                        Education
                    </h3>
                </Col>
            </Row>
            <Col xs={12} className={"mt-2 no-print"}>
                <Card>
                    <Card.Header as={"h4"} className={"bg-success text-white"}>
                        <a target={"_blank"} rel="noopener noreferrer" href="http://www.bath.ac.uk/"
                           className="text-white">
                            University of Bath
                        </a>
                    </Card.Header>

                    <Card.Body>
                        <span>
                            <a target={"_blank"} rel="noopener noreferrer"
                               href="http://www.bath.ac.uk/study/ug/prospectus/subject/computer-science-mathematics/">
                              <strong>Computer Science and Mathematics</strong>
                            </a>
                        </span>,
                        <span className={"ml-1"}>
                            1st Class Bachelor's degree
                        </span>
                        <span className={"text-grey-color ml-1"}>
                            (Oct-09 to Jul-2013)
                        </span>
                        <p className="text-justify">
                            Modules included parallel programming and computer algebra. Dissertation on learning aids in
                            educational software.
                        </p>
                    </Card.Body>
                </Card>
            </Col>
            <hr className={"no-print"}/>
            <Row className={"mt-4 no-print"}>
                <Col className={"text-center"}>
                    <a aria-label="Twitter" target={"_blank"} rel="noopener noreferrer"
                       href="https://twitter.com/adben002">
                        <FontAwesomeIcon icon={['fab', 'twitter']} className={"mr-3"} size={"3x"}/>
                    </a>
                    <a aria-label="LinkedIn" target={"_blank"} rel="noopener noreferrer"
                       href="https://www.linkedin.com/in/adben002">
                        <FontAwesomeIcon icon={['fab', 'linkedin']} className={"mr-3"} size={"3x"}/>
                    </a>
                    <a aria-label="GitHub" target={"_blank"} rel="noopener noreferrer"
                       href="https://github.com/adben002">
                        <FontAwesomeIcon icon={['fab', 'github']} size={"3x"}/>
                    </a>
                </Col>
            </Row>
        </Container>
    );
}

export default App;
