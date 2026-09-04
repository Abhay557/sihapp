/**
 * Seed PS44 portal with demo data.
 * Usage: npx tsx prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const SKILLS: Array<[string, string]> = [
  ["Data Structures", "CS Core"],
  ["Algorithms", "CS Core"],
  ["JavaScript", "Programming"],
  ["TypeScript", "Programming"],
  ["React", "Frontend"],
  ["Next.js", "Frontend"],
  ["Node.js", "Backend"],
  ["Python", "Programming"],
  ["SQL", "Data"],
  ["Machine Learning", "Data"],
  ["Cloud AWS", "Cloud"],
  ["Docker", "DevOps"],
  ["System Design", "Architecture"],
  ["Communication", "Soft Skills"],
  ["Project Management", "Management"],
  ["Product Management", "Management"],
  ["Figma", "Design"],
  ["Java", "Programming"],
];

type SeedStudent = { name: string; email: string; roll: string; dept: string; batch: string; cgpa: number; status: "APPROVED" | "PENDING" };

const STUDENTS: SeedStudent[] = [
  { name: "Aarav Sharma", email: "aarav@college.edu", roll: "CS22B001", dept: "CSE", batch: "2026", cgpa: 8.6, status: "APPROVED" },
  { name: "Diya Patel", email: "diya@college.edu", roll: "CS22B002", dept: "CSE", batch: "2026", cgpa: 9.1, status: "APPROVED" },
  { name: "Rohan Mehta", email: "rohan@college.edu", roll: "CS22B003", dept: "CSE", batch: "2026", cgpa: 7.8, status: "PENDING" },
  { name: "Sneha Rao", email: "sneha@college.edu", roll: "CS23B010", dept: "CSE", batch: "2027", cgpa: 8.2, status: "PENDING" },
  { name: "Kabir Singh", email: "kabir@college.edu", roll: "EC23B004", dept: "ECE", batch: "2027", cgpa: 7.4, status: "APPROVED" },
  { name: "Ishita Verma", email: "ishita@college.edu", roll: "EC23B005", dept: "ECE", batch: "2027", cgpa: 8.9, status: "PENDING" },
  { name: "Vivaan Gupta", email: "vivaan@college.edu", roll: "ME22B002", dept: "ME", batch: "2026", cgpa: 6.9, status: "APPROVED" as const },
];

const TEACHERS = [
  { name: "Dr. Anita Desai", email: "anita@college.edu", dept: "CSE", designation: "Professor" },
  { name: "Prof. Vikram Nair", email: "vikram@college.edu", dept: "CSE", designation: "Associate Professor" },
  { name: "Dr. Meera Krishnan", email: "meera@college.edu", dept: "ECE", designation: "Professor" },
];

const JOBS = [
  {
    title: "Product Management Intern",
    company: "Zoho",
    location: "Chennai",
    type: "INTERNSHIP",
    stipend: "₹25,000/month",
    description:
      "6-month PM internship. Own a feature area end-to-end: gather requirements, write specs, coordinate with engineering and design, track metrics. Strong communication and structured thinking required.",
    skills: ["Product Management", "Communication", "Figma", "Project Management"],
  },
  {
    title: "Frontend Engineer Intern",
    company: "Razorpay",
    location: "Bengaluru (Hybrid)",
    type: "INTERNSHIP",
    stipend: "₹40,000/month",
    description:
      "Build merchant-facing dashboard features in React + TypeScript. Work with design systems, write tests, participate in code reviews. PPO opportunity based on performance.",
    skills: ["React", "TypeScript", "JavaScript", "Next.js"],
  },
  {
    title: "Software Engineer — Backend",
    company: "Swiggy",
    location: "Bengaluru",
    type: "FULL_TIME",
    stipend: "₹18–24 LPA",
    description:
      "Design and scale high-throughput services powering food discovery. Node.js / Java microservices, SQL and NoSQL stores, heavy focus on system design and ownership.",
    skills: ["Node.js", "System Design", "SQL", "Java", "Docker"],
  },
  {
    title: "Data Science Intern",
    company: "Mu Sigma",
    location: "Remote",
    type: "INTERNSHIP",
    stipend: "₹20,000/month",
    description:
      "Analyse client datasets, build forecasting models and present insights. Python, SQL and statistics heavy role with direct client exposure.",
    skills: ["Python", "Machine Learning", "SQL"],
  },
  {
    title: "Cloud DevOps Engineer",
    company: "Freshworks",
    location: "Chennai",
    type: "FULL_TIME",
    stipend: "₹12–16 LPA",
    description:
      "Automate infrastructure on AWS, build CI/CD pipelines, containerize services, own observability. Docker and AWS depth required.",
    skills: ["Cloud AWS", "Docker", "Node.js"],
  },
  {
    title: "Full Stack Developer (PM Track)",
    company: "Postman",
    location: "Remote",
    type: "FULL_TIME",
    stipend: "₹15–20 LPA",
    description:
      "Full-stack role with a product angle — you will prototype features, talk to users and help prioritize. Next.js + Node.js stack.",
    skills: ["Next.js", "Node.js", "TypeScript", "Product Management"],
  },
];

const SIMULATIONS = [
  {
    title: "Product Manager Virtual Experience",
    company: "Accenture (Simulation)",
    domain: "Product",
    difficulty: "Intermediate",
    durationMins: 120,
    description: "Step through a PM's quarter: prioritise a backlog, write a PRD, analyse funnel metrics and present a go/no-go recommendation.",
    tasks: JSON.stringify([
      "Analyse user feedback and identify top 3 pain points",
      "Draft a one-page PRD for the highest-impact feature",
      "Build a prioritisation matrix (impact × effort)",
      "Present go/no-go recommendation with success metrics",
    ]),
  },
  {
    title: "Software Engineer Virtual Internship",
    company: "JPMorgan Chase (Simulation)",
    domain: "Software",
    difficulty: "Beginner",
    durationMins: 90,
    description: "Set up a trading dashboard patch: interface with live data feeds, fix a broken sorting algorithm, and commit clean code.",
    tasks: JSON.stringify([
      "Clone the repo and fix the price-sorting bug (O(n²) → O(n log n))",
      "Implement a 3-point moving average for live ticker data",
      "Write unit tests for the patched module",
    ]),
  },
  {
    title: "Data Science Virtual Job Simulation",
    company: "Deloitte (Simulation)",
    domain: "Data",
    difficulty: "Intermediate",
    durationMins: 100,
    description: "Clean a messy client dataset, build a churn-prediction model, and draft an executive summary of findings.",
    tasks: JSON.stringify([
      "Clean and normalise the customer dataset (missing values, duplicates)",
      "Train a churn classifier and report precision/recall",
      "Draft a one-page executive summary with recommendations",
    ]),
  },
  {
    title: "Cloud Architect Simulation",
    company: "AWS (Simulation)",
    domain: "Cloud",
    difficulty: "Advanced",
    durationMins: 150,
    description: "Design a highly-available deployment: VPC layout, autoscaling groups, load balancers, and an IaC deployment pipeline.",
    tasks: JSON.stringify([
      "Design the VPC topology (subnets, AZs, routing)",
      "Define autoscaling policies and health checks",
      "Write the CloudFormation/Terraform skeleton",
    ]),
  },
];

const PROJECTS = [
  {
    title: "Campus Placement Analytics Dashboard",
    description: "Build a dashboard that ingests placement data and visualises department-wise readiness, offer trends and skill heatmaps.",
    domain: "Full Stack",
    difficulty: "Intermediate",
    mentor: 0,
    skills: ["React", "Node.js", "SQL"],
  },
  {
    title: "AI Resume Screener for T&P Cell",
    description: "NLP pipeline that parses resumes, extracts skills and matches students to job descriptions with explainable scoring.",
    domain: "AI/ML",
    difficulty: "Advanced",
    mentor: 1,
    skills: ["Python", "Machine Learning"],
  },
  {
    title: "Smart Attendance System with Face Recognition",
    description: "Edge-deployed face-recognition attendance with a teacher approval workflow and audit logs.",
    domain: "Computer Vision",
    difficulty: "Intermediate",
    mentor: 1,
    skills: ["Python", "Machine Learning", "Docker"],
  },
  {
    title: "IoT Lab Monitoring Network",
    description: "Sensor mesh that monitors lab environment and equipment utilisation; dashboards for the admin block.",
    domain: "IoT",
    difficulty: "Beginner",
    mentor: 2,
    skills: ["Node.js", "Cloud AWS"],
  },
  {
    title: "Alumni Mentorship Platform",
    description: "Connect students with alumni mentors — matching, scheduling and feedback loops.",
    domain: "Full Stack",
    difficulty: "Beginner",
    mentor: 0,
    skills: ["Next.js", "TypeScript"],
  },
  {
    title: "College ERP Integration Middleware",
    description: "Sync student records from legacy ERP into the PS44 portal via a secure middleware API.",
    domain: "Backend",
    difficulty: "Advanced",
    mentor: 2,
    skills: ["Node.js", "SQL", "System Design"],
  },
];

const COURSES: Array<{
  title: string;
  provider: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  hrs: number;
  desc: string;
  primary: string;
  skills: string[];
  quiz: Array<{ q: string; options: string[]; answer: number }>;
}> = [
  {
    title: "Product Management Foundations",
    provider: "PS44 Academy",
    level: "BEGINNER",
    hrs: 12,
    desc: "Learn the PM fundamentals: discovery, prioritisation, PRDs, metrics and stakeholder communication.",
    primary: "Product Management",
    skills: ["Product Management", "Communication", "Project Management"],
    quiz: [
      { q: "What does a PRD primarily define?", options: ["Pricing strategy", "Product requirements & success criteria", "Marketing channels", "Team hierarchy"], answer: 1 },
      { q: "Which framework ranks features by impact vs effort?", options: ["SWOT", "RICE / Impact-Effort matrix", "BCG matrix", "Ansoff matrix"], answer: 1 },
      { q: "North Star metric is best described as…", options: ["Any KPI", "The single metric that best captures core value delivered", "Revenue target", "User count"], answer: 1 },
    ],
  },
  {
    title: "React & Next.js — Zero to Deploy",
    provider: "PS44 Academy",
    level: "INTERMEDIATE",
    hrs: 24,
    desc: "Component architecture, server rendering, data fetching, routing and deployment of a production Next.js app.",
    primary: "React",
    skills: ["React", "Next.js", "TypeScript", "JavaScript"],
    quiz: [
      { q: "In Next.js App Router, which file defines a route's UI?", options: ["index.js", "page.tsx", "route.js", "view.tsx"], answer: 1 },
      { q: "A Server Component…", options: ["Runs in the browser", "Renders on the server and ships no JS by default", "Is always interactive", "Replaces CSS"], answer: 1 },
      { q: "Which hook keeps local form state in React?", options: ["useEffect", "useState", "useMemo", "useRef"], answer: 1 },
    ],
  },
  {
    title: "SQL for Analytics",
    provider: "PS44 Academy",
    level: "BEGINNER",
    hrs: 10,
    desc: "SELECT to CTEs: joins, aggregations, window functions and query tuning for analytics workloads.",
    primary: "SQL",
    skills: ["SQL"],
    quiz: [
      { q: "Which clause filters AFTER aggregation?", options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], answer: 1 },
      { q: "A LEFT JOIN keeps…", options: ["Only matched rows", "All rows from the left table", "All rows from both", "Distinct rows"], answer: 1 },
      { q: "COUNT(*) vs COUNT(col):", options: ["Identical", "COUNT(col) skips NULLs", "COUNT(*) skips NULLs", "COUNT(col) errors on NULL"], answer: 1 },
    ],
  },
  {
    title: "Machine Learning Essentials",
    provider: "PS44 Academy",
    level: "INTERMEDIATE",
    hrs: 20,
    desc: "Supervised learning end-to-end: regression, classification, model evaluation and avoiding overfitting.",
    primary: "Machine Learning",
    skills: ["Machine Learning", "Python"],
    quiz: [
      { q: "High variance in a model typically means…", options: ["Overfitting", "Underfitting", "Perfect fit", "No data"], answer: 0 },
      { q: "Precision answers the question…", options: ["Of predicted positives, how many are real?", "Of real positives, how many were found?", "How accurate is the model?", "How fast is training?"], answer: 0 },
      { q: "Train/test split exists to…", options: ["Speed up training", "Estimate generalisation on unseen data", "Balance classes", "Reduce memory"], answer: 1 },
    ],
  },
  {
    title: "Cloud & Docker Fundamentals",
    provider: "PS44 Academy",
    level: "BEGINNER",
    hrs: 14,
    desc: "Containers, images, registries and core AWS services — build a deployable containerised service.",
    primary: "Docker",
    skills: ["Docker", "Cloud AWS"],
    quiz: [
      { q: "A Docker image is best described as…", options: ["A running process", "An immutable blueprint for containers", "A VM", "A registry"], answer: 1 },
      { q: "Which AWS service manages containers at scale?", options: ["S3", "ECS / EKS", "Lambda", "RDS"], answer: 1 },
      { q: "Dockerfile instruction that runs at container start:", options: ["CMD", "RUN", "COPY", "FROM"], answer: 0 },
    ],
  },
  {
    title: "System Design Foundations",
    provider: "PS44 Academy",
    level: "ADVANCED",
    hrs: 18,
    desc: "Scalability primitives: load balancing, caching, database replication, queues and consistency trade-offs.",
    primary: "System Design",
    skills: ["System Design"],
    quiz: [
      { q: "A load balancer…", options: ["Stores data", "Distributes traffic across servers", "Compiles code", "Encrypts disks"], answer: 1 },
      { q: "A cache primarily improves…", options: ["Durability", "Read latency & throughput", "Consistency", "Security"], answer: 1 },
      { q: "A message queue helps with…", options: ["Synchronous UI", "Decoupling producers/consumers & smoothing spikes", "Rendering", "Storage quotas"], answer: 1 },
    ],
  },
  {
    title: "Design Thinking with Figma",
    provider: "PS44 Academy",
    level: "BEGINNER",
    hrs: 8,
    desc: "Wireframes to prototypes: layout systems, components, usability heuristics and design critique.",
    primary: "Figma",
    skills: ["Figma", "Communication"],
    quiz: [
      { q: "The Figma tool used for interactive prototypes is…", options: ["Prototyping mode", "Auto-layout", "Styles", "Frames"], answer: 0 },
      { q: "Auto-layout primarily handles…", options: ["Colors", "Responsive spacing & stacking", "Version control", "Fonts"], answer: 1 },
    ],
  },
  {
    title: "Effective Communication for Interviews",
    provider: "PS44 Academy",
    level: "BEGINNER",
    hrs: 6,
    desc: "Structure answers (STAR), explain technical work simply, and run mock HR + technical rounds.",
    primary: "Communication",
    skills: ["Communication"],
    quiz: [
      { q: "STAR stands for…", options: ["Situation, Task, Action, Result", "Study, Test, Apply, Review", "Story, Timing, Answer, Reaction", "Skill, Talent, Attitude, Resume"], answer: 0 },
      { q: "The best way to handle a question you don't know:", options: ["Bluff", "Say you don't know, then reason aloud", "Stay silent", "Change topic"], answer: 1 },
    ],
  },
];

const SUBJECTS: Array<[string, string, number, Array<[string, number]>]> = [
  ["Data Structures & Algorithms", "CS201", 3, [["Data Structures", 90], ["Algorithms", 85]]],
  ["Database Management Systems", "CS302", 4, [["SQL", 80], ["Data Structures", 60]]],
  ["Web Technologies", "CS315", 5, [["JavaScript", 75], ["React", 55], ["Node.js", 50]]],
  ["Machine Learning Elective", "CS412", 7, [["Machine Learning", 85], ["Python", 70]]],
  ["Cloud Computing Elective", "CS418", 7, [["Cloud AWS", 75], ["Docker", 60]]],
  ["Professional Communication", "HS101", 1, [["Communication", 70]]],
  ["Software Engineering", "CS303", 4, [["Project Management", 65], ["System Design", 55]]],
];

function pick<T>(arr: T[], n: number, seed: number): T[] {
  const out: T[] = [];
  let s = seed;
  const rnd = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  const pool = [...arr];
  while (out.length < n && pool.length) {
    out.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  }
  return out;
}

async function main() {
  console.log("Seeding PS44 portal…");

  // wipe (order matters for FKs — cascade handles most)
  await db.session.deleteMany();
  await db.profileApproval.deleteMany();
  await db.certificate.deleteMany();
  await db.resumeAnalysis.deleteMany();
  await db.assessmentAttempt.deleteMany();
  await db.enrollment.deleteMany();
  await db.projectMember.deleteMany();
  await db.simulationRun.deleteMany();
  await db.project.deleteMany();
  await db.simulation.deleteMany();
  await db.assessment.deleteMany();
  await db.course.deleteMany();
  await db.curriculumMapping.deleteMany();
  await db.subject.deleteMany();
  await db.application.deleteMany();
  await db.job.deleteMany();
  await db.student.deleteMany();
  await db.teacher.deleteMany();
  await db.user.deleteMany();
  await db.badge.deleteMany();
  await db.studentSkill.deleteMany();
  await db.jobSkill.deleteMany();
  await db.courseSkill.deleteMany();
  await db.skill.deleteMany();

  // skills
  const skillIds = new Map<string, string>();
  for (const [name, category] of SKILLS) {
    const s = await db.skill.create({ data: { name, category } });
    skillIds.set(name, s.id);
  }

  // badges per skill
  for (const name of skillIds.keys()) {
    for (const level of ["Bronze", "Silver", "Gold"]) {
      await db.badge.create({ data: { skillId: skillIds.get(name)!, level, label: `${name} ${level}` } });
    }
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  // teachers
  const teacherIds: string[] = [];
  for (const t of TEACHERS) {
    const u = await db.user.create({
      data: {
        name: t.name,
        email: t.email,
        passwordHash,
        role: "TEACHER",
        teacher: { create: { department: t.dept, designation: t.designation } },
      },
      include: { teacher: true },
    });
    teacherIds.push(u.teacher!.id);
  }

  // students
  const studentIds: string[] = [];
  for (let i = 0; i < STUDENTS.length; i++) {
    const st = STUDENTS[i];
    const u = await db.user.create({
      data: {
        name: st.name,
        email: st.email,
        passwordHash,
        role: "STUDENT",
        student: { create: { rollNumber: st.roll, department: st.dept, batch: st.batch, cgpa: st.cgpa, status: st.status } },
      },
      include: { student: true },
    });
    const sid = u.student!.id;
    studentIds.push(sid);

    // skill profile — deterministic spread
    const chosen = pick(SKILLS.map(([n]) => n), 8, i * 97 + 13);
    for (let j = 0; j < chosen.length; j++) {
      const level = 35 + ((i * 31 + j * 23) % 60);
      await db.studentSkill.create({ data: { studentId: sid, skillId: skillIds.get(chosen[j])!, level } });
    }
  }

  // teacher-approved records
  await db.profileApproval.create({
    data: { studentId: studentIds[0], teacherId: teacherIds[0], action: "APPROVED", note: "Records verified." },
  });
  await db.profileApproval.create({
    data: { studentId: studentIds[4], teacherId: teacherIds[2], action: "APPROVED", note: "ECE records verified." },
  });

  // jobs
  const jobIds: string[] = [];
  for (const j of JOBS) {
    const job = await db.job.create({
      data: {
        title: j.title,
        company: j.company,
        location: j.location,
        type: j.type as "INTERNSHIP" | "FULL_TIME",
        description: j.description,
        stipend: j.stipend,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * (10 + jobIds.length * 5)),
        postedById: teacherIds[0],
      },
    });
    jobIds.push(job.id);
    for (const sname of j.skills) {
      await db.jobSkill.create({ data: { jobId: job.id, skillId: skillIds.get(sname)! } });
    }
  }

  // applications for first student
  await db.application.create({
    data: { studentId: studentIds[0], jobId: jobIds[0], status: "INTERVIEW", note: "PM internship — round 2 scheduled." },
  });
  await db.application.create({
    data: { studentId: studentIds[0], jobId: jobIds[2], status: "APPLIED" },
  });
  await db.application.create({
    data: { studentId: studentIds[1], jobId: jobIds[1], status: "OFFER", note: "PPO offered post internship." },
  });

  // simulations
  const simIds: string[] = [];
  for (const s of SIMULATIONS) {
    const sim = await db.simulation.create({ data: { ...s, tasks: s.tasks } });
    simIds.push(sim.id);
  }
  await db.simulationRun.create({
    data: { studentId: studentIds[0], simulationId: simIds[0], score: 82, completed: true, completedAt: new Date() },
  });
  await db.certificate.create({
    data: {
      studentId: studentIds[0],
      kind: "SIMULATION",
      title: "Product Manager Virtual Experience",
      issuer: "Accenture (Simulation)",
      code: "SIM-A1B2C3",
    },
  });

  // projects
  const projectIds: string[] = [];
  for (const p of PROJECTS) {
    const proj = await db.project.create({
      data: {
        title: p.title,
        description: p.description,
        domain: p.domain,
        difficulty: p.difficulty,
        mentorId: teacherIds[p.mentor],
        status: projectIds.length === 0 ? "IN_PROGRESS" : "OPEN",
      },
    });
    projectIds.push(proj.id);
    const ms = ["Requirements & scope", "Prototype / implementation", "Testing & review", "Final demo & report"];
    for (let m = 0; m < ms.length; m++) {
      await db.projectMilestone.create({
        data: {
          projectId: proj.id,
          title: ms[m],
          done: proj.status === "IN_PROGRESS" ? m < 2 : false,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * (7 * (m + 1))),
        },
      });
    }
  }
  await db.projectMember.create({ data: { projectId: projectIds[0], studentId: studentIds[0], role: "Lead" } });
  await db.projectMember.create({ data: { projectId: projectIds[0], studentId: studentIds[1], role: "Member" } });
  await db.certificate.create({
    data: {
      studentId: studentIds[0],
      kind: "PROJECT",
      title: "Campus Placement Analytics Dashboard",
      issuer: "PS44 Portal",
      code: "PRJ-X9Y8Z7",
    },
  });

  // courses + assessments
  const courseIds: string[] = [];
  for (const c of COURSES) {
    const course = await db.course.create({
      data: {
        title: c.title,
        provider: c.provider,
        level: c.level,
        description: c.desc,
        durationHrs: c.hrs,
        skillId: skillIds.get(c.primary)!,
      },
    });
    courseIds.push(course.id);
    for (const sname of c.skills) {
      await db.courseSkill.create({ data: { courseId: course.id, skillId: skillIds.get(sname)! } });
    }
    await db.assessment.create({
      data: { courseId: course.id, title: `${c.title} — Assessment`, questions: JSON.stringify(c.quiz), passScore: 60 },
    });
  }

  // sample enrollment + completed course with badge-worthy attempt
  await db.enrollment.create({ data: { studentId: studentIds[0], courseId: courseIds[0], status: "COMPLETED", progress: 100, completedAt: new Date() } });
  const pmAssessment = await db.assessment.findUnique({ where: { courseId: courseIds[0] } });
  if (pmAssessment) {
    await db.assessmentAttempt.create({
      data: { studentId: studentIds[0], assessmentId: pmAssessment.id, score: 88, passed: true },
    });
  }
  await db.certificate.create({
    data: { studentId: studentIds[0], kind: "COURSE", title: "Product Management Foundations", issuer: "PS44 Academy", code: "CRS-PM1234" },
  });

  // curriculum mapping
  for (const [name, code, sem, maps] of SUBJECTS) {
    const sub = await db.subject.create({ data: { name, code, semester: sem } });
    for (const [skillName, coverage] of maps) {
      await db.curriculumMapping.create({ data: { subjectId: sub.id, skillId: skillIds.get(skillName)!, coverage } });
    }
  }

  console.log("Seed complete.");
  console.log("Logins (password: password123):");
  console.log("  teacher: anita@college.edu");
  console.log("  student: aarav@college.edu (APPROVED, rich data)");
  console.log("  student: rohan@college.edu (PENDING approval)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
