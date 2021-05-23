import { Component } from '@angular/core';
import {
  faBookmark,
  faCogs,
  faBriefcase,
  faGraduationCap,
} from '@fortawesome/free-solid-svg-icons';
import {
  faTwitter,
  faLinkedin,
  faGithub,
} from '@fortawesome/free-brands-svg-icons';

type YearObject = {
  readonly from: Date;
  readonly to?: Date;
};

type JobInfo = {
  readonly role: string;
  readonly place: string;
  readonly placeUrl: string;
  readonly range: YearObject;
  readonly technicalScope: string;
  readonly details: string;
  readonly keyContributions: string[];
};

function formatZeroIndexedDate(day: number, month: number, year: number): Date {
  return new Date(year, month - 1, day);
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  readonly faBookmark = faBookmark;
  readonly faCogs = faCogs;
  readonly faBriefcase = faBriefcase;
  readonly faGraduationCap = faGraduationCap;
  readonly faTwitter = faTwitter;
  readonly faLinkedin = faLinkedin;
  readonly faGithub = faGithub;
  readonly formatZeroIndexedDate = formatZeroIndexedDate;

  readonly jobs: JobInfo[] = [
    {
      role: 'Technical Consultant',
      place: 'CACI Ltd',
      placeUrl: 'https://www.caci-iig.co.uk/index.php',
      range: {
        from: formatZeroIndexedDate(2, 3, 2020),
      },
      technicalScope: 'Python, Node, AWS, Angular',
      details: `
            Consulted for MetOffice Space Weather designing, developing, configuring, testing, and debugging AWS cloud-native applications. 
        `,
      keyContributions: [
        'Addition of MetOffice single sign-on authentication to forecaster angular web client and API.',
        'Suggested and implemented enhancement for the application and also continuous integration.',
      ],
    },
    {
      role: 'Full stack software engineer',
      place: 'Jisc',
      placeUrl: 'https://www.jisc.ac.uk/',
      range: {
        from: formatZeroIndexedDate(9, 6, 2020),
        to: formatZeroIndexedDate(2, 3, 2020),
      },
      technicalScope: 'Java, Google Cloud, GWT',
      details: `
            Developed and maintained custom applications, web applications and APIs utilising google cloud platform.
        `,
      keyContributions: [
        'Developed and deployed google cloud function to transform large CSV files.',
        'Developed new features for a custom application utilising SAML integration and GWT.',
        'Implemented integration with seamless access iframe, while addressing web security concerns.',
        'Uplifted Node.js google cloud function to Node.js 10.',
      ],
    },
    {
      role: 'Contract Software Engineer',
      place: 'Royal Bank of Scotland (RBS)',
      placeUrl:
        'https://www.business.rbs.co.uk/business/ways-to-bank/bankline.html',
      range: {
        from: formatZeroIndexedDate(4, 6, 2018),
        to: formatZeroIndexedDate(9, 6, 2020),
      },
      technicalScope: 'Java, Kotlin, DB2',
      details: `
            Analyse, design, develop, configure, test, and debug software/application enhancements and new
            implementations. Apply industry-standard technologies; and implement high-quality solutions
            aligned with business needs and specifications. Collaborate with cross-functional teams, creating a
            DB2 database for confirmation of payee checks; and manage third-party service, ensuring alignment
            with API requirements. Gather requirements, translating requirements into technical solutions.
        `,
      keyContributions: [
        'Architected, designed and implemented new Kotlin confirmation of payee microservice for New Bankline, supporting 15K concurrent payments.',
        'Led Cucumber features addition project, conducting acceptance tests on Java and Kotlin microservices.',
      ],
    },
    {
      role: 'Senior Developer',
      place: 'Scott Logic',
      placeUrl: 'http://www.scottlogic.com/',
      range: {
        from: formatZeroIndexedDate(1, 4, 2017),
        to: formatZeroIndexedDate(4, 6, 2018),
      },
      technicalScope: 'Hibernate, Test Data Generation Library',
      details: `
            Developed and maintained custom applications, web applications and APIs, integrating custom
            platforms with third-party systems. Owned solution design and architectural decisions; and resolve
            code issues, troubleshooting and determining the root cause.
        `,
      keyContributions: [
        'Developed open-source Java library for POJO and test data generation for Hibernate, publishing process to maven central.',
        'Led active savings project in an Agile environment for Hargreaves Lansdown, enhancing bank processes for opening bank accounts and transferring funds.',
      ],
    },
    {
      role: 'Senior Developer',
      place: 'Information Processing Limited (IPL)',
      placeUrl: 'https://www.civica.com/en-GB/civica-digital/',
      range: {
        from: formatZeroIndexedDate(1, 10, 2015),
        to: formatZeroIndexedDate(1, 4, 2017),
      },
      technicalScope:
        'MySQL DB, Java, Spring Batch, Lucene, XML, Selenide, PhantomJS, AWS S3, AngularJs',
      details: `
            Directed and mentored development teams in Poland and the United Kingdom, performing code
            reviews and providing technical leadership. Produced technical documentation; and owned design
            and implementation projects, building code structure and design.
        `,
      keyContributions: [
        'Developed and maintained parallel spring batch process to export timeline data from multiple database tables, publishing files to AWS S3 buckets and sending SQS messages.',
        'Implemented inbound interface to receive files comprising 22 million XML records, and translated data into a system database.',
        'Served as Joint Technical Lead, leading RSP sub-project providing inbound/outbound interfaces; and presented the design and implementation features to Service Team.',
        'Optimised and enhanced performance of complex algorithms; and implemented validation tools for migrated data and framework.',
        'Continued as Senior Developer and Joint Technical Lead following IPL merger with Civica Digital in 2017.',
      ],
    },
    {
      role: 'Developer',
      place: 'Information Processing Limited (IPL)',
      placeUrl: 'http://www.ipl.com/',
      range: {
        from: formatZeroIndexedDate(1, 7, 2013),
        to: formatZeroIndexedDate(1, 10, 2015),
      },
      technicalScope: 'MySQL, Hibernate, Spring MVC, JSP, jQuery',
      details: `
            Developed full-stack web applications, collaborating with cross-functional teams to gather
            requirements and feature specifications. Delivered code in-line with development sprints;
            and wrote tests.
        `,
      keyContributions: [
        'Performed CRUD and search operations for millions of information records.',
      ],
    },
  ];

  formatDate(date: Date | undefined): string {
    if (!date) {
      return 'Present';
    }

    // Create a list of names for the months
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    // return a formatted date
    return months[date.getMonth()] + '-' + date.getFullYear();
  }
}
