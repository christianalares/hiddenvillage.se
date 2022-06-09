type Item = {
  id: string
  title: string
  url?: string
  from: Date
  to?: Date
  role: string
  tags: string[]
  description: string[]
}

const workItems: Item[] = [
  {
    id: '1',
    title: 'Robotkodarn',
    from: new Date('2016'),
    to: new Date('2017'),
    role: 'Frontend Developer',
    tags: [
      'JavaScript',
      'HTML',
      'CSS',
      'React',
      'Redux',
      'MongoDB',
      'Mongoose',
      'Hapi.js',
      'Joi',
      'Node.js',
      'Arduino',
      'Git',
      'Github',
      'Git Flow',
      'Agile workflow',
    ],
    description: [
      'Robotkodarn is a web based application helping students and teachers in elementary school to get started with programming. The application is developed to meet Skolverkets new guidelines regarding programming in elementary school.',
      'The goal is to guide the user through the basics of programming in an engaging way, offering problem solving through programming. The knowledge is concretized through hardware and robots.',
      'The application is built using React/Redux in the front-end, and NodeJS/Express as back-end. A chrome app is also built in order to make us of the possibilities for integrating with the USB interface between the front-end and the robot connected to the computer.',
    ],
  },
  {
    id: '2',
    title: 'Roder Innovation',
    from: new Date('2017-11'),
    to: new Date('2018-04'),
    role: 'Frontend Developer',
    tags: ['JavaScript', 'HTML', 'CSS', 'React', 'Redux', 'WebAudio', 'IoT', 'Canvas', 'Git', 'BitBucket'],
    description: [
      'I was one of three developers working on a confidential project for Roder Innovation. The scope of the project was to develop a digital tool used for sound analyses. The tool is integrated with a special IoT hardware, where my experience in audio creation was greatly appreciated.',
    ],
    url: 'http://www.roderinnovation.com',
  },
  {
    id: '3',
    title: 'H&M',
    from: new Date('2018-03'),
    to: new Date('2019-04'),
    role: 'Frontend Developer',
    tags: ['JavaScript', 'HTML', 'CSS', 'SCSS', 'React', 'Redux', 'Webpack', 'NodeJS', 'Git', 'Jira'],
    description: [
      'I worked in a team consisting of six frontend developers responsible for developing a new club concept for all H&M users.',
      'I joined a newly formed club concept team at H&M. The club team distinguished itself from other development teams at H&M by using modern techniques (at the time) such as React and Redux. After a successful launch of the project in the fall 2018, other H&M projects have followed and are continuously being rebuilt using similar techniques.',
      'The club concept application is built with React and Redux with Webpack as a code bundler. I had a leading role, together with two other developers, for setting up the project and its code base. I had an active part in planning and designing all relevant API:s.',
      'I got a key role in tying the communication around maintenance and deployment together, between the front end team in Sweden and the Italian backend and maintenance team seated in Milan.',
    ],
    url: 'https://www.hm.com',
  },
  {
    id: '4',
    title: 'Exodox',
    from: new Date('2019-04'),
    to: new Date('2020-05'),
    role: 'Fullstack Developer',
    tags: ['React', 'NextJS', 'Redux', 'NodeJS', 'Express', 'Webpack'],
    description: [
      'Developing a micropayment service for a startup called Exodox, enabling users to provide and consume content on the Internet.',
      'The team consisted of five developers and two UX Designers. My role has covered both frontend and backend development using a React (NextJS)/Redux-stack for the frontend and NodeJS (Express) for the backend. The project is built using microservices for a better and easier maintenance.',
    ],
  },
  {
    id: '5',
    title: 'SWITCHR',
    from: new Date('2020-05'),
    to: new Date('2020-12'),
    role: 'Frontend Developer',
    tags: ['React', 'Redux', 'NodeJS', 'SCSS', 'Webpack', 'GitLab', 'CI/CD', 'Flow', 'Jest', 'Contentful', 'Stripe'],
    description: [
      'SWITCHR is the global movement where customers own and make money on solar panels in large scale power plants. Customers create a passive income while following the energy production in real time on your smartphone.',
      'I worked as a developer with responsibility for the front end stack and architecture. A lot of my work consisted of migrating the code to be more modern and up-to-date. The legacy CMS was converted to a headless CMS called Contentful and the rather obsolete react and redux architecture was converted to a more modern readable and maintainable style. I also rebuilt the payment checkout using Stripe and coded the new redesign.',
    ],
    url: 'https://switchr.com',
  },
  {
    id: '6',
    title: 'Doctrin',
    from: new Date('2020-12'),
    to: new Date('2021-05'),
    role: 'Fullstack Developer',
    tags: ['KoaJS', 'React', 'Redux', 'CSS', 'Webpack', 'GitHub', 'GitHub Actions', 'Storybook', 'Jest', 'Cypress'],
    description: [
      'Doctrin is an online, chat based, Health Care Center who&apos;s largest customer is Capio. A majority of health care visits today can be solved online and Doctrin aim to relieve pressure on healthcare centers and only provide physical appointments with doctors when necessary.',
      'The service is built using microservices. The backend is written in KoaJS and the front-end is built with React and Redux.',
      'I worked in a team consisting of two developers, two UX designers, one tester and one product owner. He developed new features for patients, caregivers and internal systems. He was also responsible for technical improvements among the whole stack such as modernizing the code, updating legacy solutions to be more modern and less error-prone.',
    ],
    url: 'https://doctrin.se',
  },
  {
    id: '7',
    title: 'Svenskt Näringsliv',
    from: new Date('2021-09'),
    role: 'Fullstack Developer',
    tags: ['NodeJS', 'Express', 'React', 'Redux', 'CSS', 'Canvas', 'Webpack', 'Bitbucket', 'Azure DevOps', 'Sentry'],
    description: [
      'The Confederation of Swedish Enterprise produces improvement to the business climate. They represent business in discussions with unions and authorities.',
      'The site is built with a server side rendered React application. It&apos;s hosted on Azure, and built using Azure pipelines.',
    ],
    url: 'https://www.svensktnaringsliv.se',
  },
].reverse()

// TODO: Fetch items from some kind of backend/cms
const useWorkItems = () => {
  return workItems
}

export default useWorkItems
