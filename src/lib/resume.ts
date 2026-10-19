// All resume content lives in this file. The windows and the print layout only render it.

export interface Profile {
  name: string;
  /** Lowercase first name, used for the shell prompt. */
  handle: string;
  title: string;
  tagline: string;
  location: string;
  /** Main technologies, shown as the "stack" in About and the terminal. */
  stack: string[];
  /** GitHub user name; live repo data is fetched for it. Leave empty to switch that off. */
  github: string;
}

export interface Job {
  role: string;
  company: string;
  period: string;
  bullets: string[];
  /** Technologies named in this job's bullets. */
  tech: string[];
}

export interface Stat {
  value: string;
  label: string;
}

export interface Project {
  name: string;
  href: string;
  /** Headline numbers lifted from the bullets; shown as a row of chips. */
  stats?: Stat[];
  bullets: string[];
  tech: string[];
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface School {
  degree: string;
  school: string;
  period: string;
  result: string;
}

export interface Education extends School {
  /** Earlier qualifications, newest first. */
  earlier: School[];
}

export interface ContactLink {
  label: string;
  value: string;
  href: string;
}

export const profile: Profile = {
  name: 'Mehedi Hasan',
  handle: 'mehedi',
  title: 'Software Engineer',
  tagline:
    'Software engineer building Spring Boot microservices and Angular front ends for loan origination and e-commerce systems.',
  location: 'Dhaka, Bangladesh',
  stack: ['Java', 'Spring Boot', 'Angular'],
  github: 'MehediHasanRapiIIT',
};

export const experience: Job[] = [
  {
    role: 'Junior Software Engineer',
    company: 'Leads Corporation Limited',
    period: 'Jan 2026 – Present',
    bullets: [
      'Develop and maintain backend microservices for a Loan Origination System using Java and Spring Boot.',
      'Build and enhance Angular frontend modules for loan application workflows and customer-facing dashboards.',
      'Developed document and file upload features, and APIs to preview and visualize the complete loan workflow end to end.',
      'Worked on the Loan Asset, Mortgage and Collateral modules, handling data models and business logic for secured lending workflows.',
      'Track work in Azure DevOps and take part in Agile sprints: sprint planning, daily standups and retrospectives.',
    ],
    tech: ['Java', 'Spring Boot', 'Microservices', 'Angular', 'Azure DevOps', 'Agile'],
  },
  {
    role: 'Intern Software Developer',
    company: 'Vendy Limited',
    period: 'May 2024 – Oct 2024',
    bullets: [
      'Developed RESTful APIs in Laravel for third-party integrations.',
      'Improved data flow in MIS core modules.',
      'Designed a Warehouse Management System with essential features.',
      'Built responsive frontend modules using Angular.',
      'Collaborated on team-based development, debugging and deployment.',
    ],
    tech: ['Laravel', 'RESTful APIs', 'Angular'],
  },
];

export const projects: Project[] = [
  {
    name: 'Full-Stack E-Commerce Platform',
    href: 'https://github.com/MehediHasanRapiIIT/Erezer',
    stats: [
      { value: '48', label: 'controllers' },
      { value: '40+', label: 'services' },
      { value: '43', label: 'repositories' },
      { value: '42', label: 'DB entities' },
      { value: '20+', label: 'admin modules' },
      { value: '25', label: 'HTTP services' },
    ],
    bullets: [
      'Architected and built a production apparel e-commerce platform end to end: a Spring Boot 3 / Java 21 REST backend (48 controllers, 40+ services, 43 repositories) serving two Angular 21 front ends, with a layered controller-service-repository design, MapStruct DTO mapping, Bean Validation, a global exception handler and springdoc OpenAPI documentation.',
      'Secured the API with dual Spring Security filter chains under an explicit default-deny policy: Keycloak OIDC resource-server JWT validation for admin routes and self-issued access/refresh JWTs for customer routes, with stateless sessions, Redis-backed rate limiting, OTP email verification and correlation-ID request tracing.',
      'Designed a normalized 42-entity PostgreSQL schema with Spring Data JPA and versioned Flyway migrations covering products, size variants, inventory, orders, payments, returns and promotions; wrote native SQL aggregation queries for sales reports and customer lifetime-value analytics.',
      'Implemented a stackable promotions and pricing engine (multi-scope discounts, coupon redemption limits, flash sales, "Buy X Get Y" bundles, shipping zones, tax rules) behind a single server-authoritative checkout quote, so the displayed price always equals the charged price, with bKash payment-gateway integration.',
      'Engineered an event-driven order lifecycle with Spring application events and asynchronous listeners: status-history auditing, Thymeleaf email and SMS notifications, server-rendered PDF invoices (openhtmltopdf/PDFBox), RMA returns with photo evidence, async newsletter campaigns and live stock updates over WebSocket/STOMP.',
      'Developed the internal admin panel as a standalone-component Angular 21 app spanning 20+ lazy-loaded feature modules (catalog, orders, coupons, discounts, bundles, returns, inventory, reports, newsletter, support) with 25 typed HTTP services, Keycloak route guards and a token-refreshing interceptor.',
      'Built the customer storefront with Angular signals state stores (cart and wishlist persisted to local storage), a single typed HTTP gateway, Tailwind CSS v4 with dark mode, runtime EN/BN internationalization, SEO metadata and JSON-LD, Meta Pixel analytics and a Fabric.js custom-design studio for made-to-order apparel.',
      'Containerized and deployed the full stack with Docker Compose (PostgreSQL, Redis, MinIO object storage, Keycloak, a Caddy HTTPS/HTTP3 reverse proxy with automated nightly database backups), instrumented with Sentry and structured JSON logging, with GitHub Actions CI publishing images to GHCR.',
    ],
    tech: [
      'Java 21',
      'Spring Boot 3',
      'Spring Data JPA',
      'Spring Security',
      'OAuth2/OIDC',
      'JWT',
      'MapStruct',
      'Lombok',
      'Gradle',
      'PostgreSQL',
      'Flyway',
      'Redis',
      'MinIO',
      'WebSocket/STOMP',
      'Thymeleaf',
      'Angular 21',
      'TypeScript',
      'RxJS',
      'Angular Signals',
      'Tailwind CSS v4',
      'Keycloak',
      'JUnit',
    ],
  },
  {
    name: 'Hospital Management System',
    href: 'https://github.com/MehediHasanRapiIIT/HospitalManagementBackendSystem',
    bullets: [
      'Built a secure Hospital Management System in Spring Boot with RESTful APIs for managing patients, doctors and appointments.',
      'Integrated Spring Security with JWT, RBAC and OAuth2 (Google, GitHub) for role-based authentication.',
      'Designed an optimized PostgreSQL schema with Spring Data JPA for efficient data handling and relationships.',
    ],
    tech: [
      'Java',
      'Spring Boot',
      'Spring Data JPA',
      'Spring Security',
      'PostgreSQL',
      'JWT',
      'OAuth2',
      'RBAC',
      'Maven',
      'Lombok',
    ],
  },
  {
    name: 'EmployeeTaskTracker',
    href: 'https://github.com/MehediHasanRapiIIT/EmployeeTaskTrackerAPI',
    bullets: [
      'Developed a backend system to manage employees, departments, projects and tasks with full CRUD operations.',
      'Used SQL JOINs for detailed reporting on employee–task–project relationships.',
      'Integrated Spring Security, Jakarta Validation and Swagger for secure, validated and documented APIs.',
    ],
    tech: [
      'Spring Boot',
      'Spring Data JPA',
      'Spring Security',
      'MySQL',
      'Hibernate',
      'Swagger',
      'Lombok',
      'Maven',
    ],
  },
  {
    name: 'BlogNest',
    href: 'https://github.com/MehediHasanRapiIIT/BlogNest',
    bullets: [
      'Built a blog platform managing users, categories, posts and comments through RESTful APIs.',
      'Implemented Spring Security for authentication and authorization, plus image upload support for posts.',
      'Designed a modular architecture with DTO mapping, validation and persistence using Spring Data JPA.',
      'Added Swagger for interactive API documentation and endpoint testing.',
    ],
    tech: ['Java', 'Spring Boot', 'Spring Data JPA', 'Spring Security', 'MySQL', 'Maven'],
  },
  {
    name: 'Library Management System',
    href: 'https://github.com/MehediHasanRapiIIT/LibraryManamgementSystem',
    bullets: [
      'Developed a console-based Library Management System in Java using OOP principles.',
      'Implemented CRUD features for books and members with issue, return and overdue tracking.',
      'Managed availability and waitlists using collections such as HashMap, ArrayList and Queue.',
    ],
    tech: ['Java', 'OOP', 'HashMap', 'ArrayList', 'Queue', 'Scanner (CLI)'],
  },
];

/** Smaller projects, taken from the repos' own READMEs. Shown under "More" in the Projects window. */
export const moreProjects: Project[] = [
  {
    name: 'Quiz App (Microservices)',
    href: 'https://github.com/MehediHasanRapiIIT/QuizAppUisngMicroservice',
    bullets: [
      'Built a quiz application as four Spring Boot services: a Eureka service registry, a Spring Cloud Gateway API gateway, a Question Service and a Quiz Service.',
      'Every service registers with Eureka for dynamic discovery, so no network locations are hard-coded; the gateway routes all client requests.',
      'The Quiz Service fetches each quiz’s questions from the Question Service through a declarative OpenFeign client.',
    ],
    tech: [
      'Java 17',
      'Spring Boot 3',
      'Spring Cloud',
      'Netflix Eureka',
      'Spring Cloud Gateway',
      'OpenFeign',
      'Spring Data JPA',
      'MySQL',
      'Lombok',
      'Maven',
    ],
  },
  {
    name: 'Inventory Enigma',
    href: 'https://github.com/MehediHasanRapiIIT/Inventory-Enigma',
    bullets: [
      'Built an inventory and billing REST API in four levels: product CRUD, stock control, invoicing and analytics.',
      'Product CRUD with auto-generated SKUs; stock add/remove that never goes below zero, raising InsufficientStockException and logging every change to a stock_log table.',
      'Transactional multi-product invoices that deduct stock automatically and roll back on insufficient stock, numbered INV-YYYYMMDD-XXXX.',
      'Analytics endpoints for stock value, today’s invoices and revenue, and low-stock alerts, with global exception handling, @Valid input validation and Swagger docs.',
    ],
    tech: [
      'Java 17',
      'Spring Boot 3.5',
      'PostgreSQL',
      'Spring Data JPA',
      'Jakarta Validation',
      'Swagger/OpenAPI',
      'Lombok',
      'Maven',
    ],
  },
  {
    name: 'Connect-4 with Minimax AI',
    href: 'https://github.com/MehediHasanRapiIIT/Connect-4',
    bullets: [
      'Built a Connect-4 game in Java with a JavaFX interface on the standard six-row, seven-column grid.',
      'The computer opponent uses the Minimax algorithm; either the human or the computer can start.',
      'Detects four in a row vertically, horizontally and diagonally, and declares a draw when the board fills. A browser port is playable in lab.dir.',
    ],
    tech: ['Java', 'JavaFX', 'Minimax'],
  },
  {
    name: 'Sign Language Detection System',
    href: 'https://github.com/MehediHasanRapiIIT/Sign-Language-Detection-System',
    bullets: [
      'Uses machine learning, trained on a dataset of sign-language gestures, to recognise hand gestures for English alphabet letters.',
      'Converts sign language to text, text to sign language, and text to speech.',
    ],
    tech: ['Python', 'Machine Learning', 'PHP', 'MySQL'],
  },
  {
    name: 'Liver Disease Detection',
    href: 'https://github.com/MehediHasanRapiIIT/LIVER-DISEASE-DETECTION',
    bullets: [
      'Compared SVM, Decision Tree and Random Forest classifiers for liver disease detection on accuracy, precision, recall and F1-score.',
    ],
    tech: ['Python', 'Jupyter Notebook', 'SVM', 'Decision Tree', 'Random Forest'],
  },
];

export const skills: SkillGroup[] = [
  { label: 'Languages', items: ['Java', 'JavaScript', 'TypeScript'] },
  {
    label: 'Backend & Security',
    items: ['Spring Boot', 'RESTful APIs', 'JWT', 'OAuth2', 'Role-based Access'],
  },
  { label: 'Frontend', items: ['Angular', 'HTML', 'CSS', 'Bootstrap'] },
  {
    label: 'Databases & Tools',
    items: [
      'MySQL',
      'PostgreSQL',
      'MongoDB',
      'Git',
      'GitHub',
      'JIRA',
      'Docker',
      'Postman (API testing)',
      'JUnit (unit, integration)',
    ],
  },
  {
    label: 'Concepts',
    items: [
      'OOP',
      'SOLID Principles',
      'Design Patterns',
      'Data Structures & Algorithms',
      'SDLC',
      'DBMS',
    ],
  },
];

export const education: Education = {
  degree: 'B.Sc. in Software Engineering',
  school: 'Noakhali Science and Technology University',
  period: '2019 – 2025',
  result: 'CGPA 3.31',
  earlier: [
    { degree: 'HSC', school: 'Noakhali Govt. College', period: '2019', result: 'GPA 5.00' },
    {
      degree: 'SSC',
      school: 'Begumganj Govt. Pilot High School',
      period: '2017',
      result: 'GPA 5.00',
    },
  ],
};

export const contacts: ContactLink[] = [
  { label: 'EMAIL', value: 'hasanrafi.iit@gmail.com', href: 'mailto:hasanrafi.iit@gmail.com' },
  { label: 'PHONE', value: '+880 1646-065553', href: 'tel:+8801646065553' },
  {
    label: 'GITHUB',
    value: 'github.com/MehediHasanRapiIIT',
    href: 'https://github.com/MehediHasanRapiIIT',
  },
  {
    label: 'LINKEDIN',
    value: 'linkedin.com/in/hasanrafiiit',
    href: 'https://www.linkedin.com/in/hasanrafiiit/',
  },
  {
    label: 'LEETCODE',
    value: 'leetcode.com/u/mehedihasan81007',
    href: 'https://leetcode.com/u/mehedihasan81007',
  },
];
