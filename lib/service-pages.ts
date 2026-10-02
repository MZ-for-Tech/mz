export type ServicePage = {
  slug: string;
  title: string;
  heading: string;
  description: string;
  intro: string;
  problems: string[];
  deliverables: string[];
  process: string[];
  limitations: string;
  evidence: { label: string; href: string; context: string };
  faqs: { question: string; answer: string }[];
  related: string[];
};

export const SERVICE_PAGES: ServicePage[] = [
  {
    slug: 'custom-software-development', title: 'Custom Software Development | MZ for Tech',
    heading: 'Custom software built around your workflow.',
    description: 'Custom applications and internal platforms from MZ for Tech in Cairo, with discovery, implementation, documentation and team handover.',
    intro: 'When spreadsheets, disconnected tools or an off-the-shelf application no longer fit, MZ helps you define and build a system around the work your team actually does. We scope the application with the people who will use and maintain it.',
    problems: ['Repeated manual work and information copied between tools.', 'A product idea that needs a usable application and a clear technical scope.', 'An existing workflow that needs permissions, consistent data and reliable reporting.'],
    deliverables: ['A requirements map with user journeys and acceptance criteria.', 'An application with the agreed interfaces, data model and integrations.', 'Testing, deployment documentation and a practical handover for your team.'],
    process: ['Discovery: map users, workflows, constraints and existing systems; decide what belongs in the first release.', 'Implementation: build and review working increments against agreed acceptance criteria.', 'Handover: document operation and maintenance, train the team, and agree any ongoing support separately.'],
    limitations: 'Scope depends on integration access, data quality and stakeholder availability. Discovery may show that adapting an existing tool is more useful than a custom build. Timelines and support terms are agreed for the actual project.',
    evidence: { label: 'Nested United case study', href: '/work/nested-united', context: 'Our multi-brand website case study shows a reusable component approach. It is web delivery evidence, rather than proof of every internal-platform use case.' },
    faqs: [{ question: 'Can we begin with a smaller release?', answer: 'Yes. Discovery identifies the core workflow and the acceptance criteria for a useful first release, with later work scoped separately.' }, { question: 'Can you connect to our current tools?', answer: 'We assess the available APIs, permissions and data formats before committing to an integration. Share the systems you need to connect in your brief.' }],
    related: ['web-development', 'erp-internal-systems'],
  },
  {
    slug: 'web-development', title: 'Website & Web App Development | MZ for Tech',
    heading: 'Websites, storefronts and web applications.',
    description: 'MZ for Tech builds business websites, e-commerce storefronts and web applications with useful content, responsive interfaces and team handover.',
    intro: 'A company website needs to explain your business and help visitors act. A storefront needs product and purchasing journeys. A web application needs workflows for returning users. We start by identifying which of these jobs your project needs to do.',
    problems: ['A business or multi-brand group with a confusing digital presence.', 'A storefront that needs a clear catalogue and practical shopping experience.', 'An online service that needs application interfaces beyond a marketing page.'],
    deliverables: ['Content and information structure for the agreed pages and journeys.', 'Responsive interfaces and reusable components, with accessibility and discoverability checks.', 'Agreed content, commerce or application integrations, deployment guidance and editing handover.'],
    process: ['Discovery: identify audiences, primary actions, content ownership and integration requirements.', 'Implementation: review page structure and design, then build and test the agreed journeys across screen sizes.', 'Handover: explain content updates and operating requirements; define maintenance and support scope.'],
    limitations: 'Search rankings are external outcomes. Payments, delivery, catalogue ownership and third-party subscriptions require separate configuration and client decisions. We do not promise a universal performance score.',
    evidence: { label: 'Nested United: one website for five brands', href: '/work/nested-united', context: 'Read the information structure, reusable component and motion work. ZStore, linked from Work, is a fictional storefront demonstration.' },
    faqs: [{ question: 'Do I need a website or a web application?', answer: 'If visitors mainly read and contact you, start with a website. If users sign in and complete recurring tasks, an application may be needed. We can scope both together when the journeys overlap.' }, { question: 'Can my team update the site?', answer: 'We agree which content your team owns and which editing tools fit the project, then include that workflow in handover.' }],
    related: ['custom-software-development', 'knowledge-transfer'],
  },
  {
    slug: 'erp-internal-systems', title: 'ERP & Internal Business Systems | MZ for Tech',
    heading: 'Business systems that connect daily operations.',
    description: 'Scope ERP and internal operations systems with MZ for Tech: workflows, permissions, reporting, integrations and practical team training.',
    intro: 'Internal systems should make ownership and next steps clear. MZ works with your team to map operations, approvals and reporting needs before deciding how an ERP or a focused internal application should support them.',
    problems: ['Duplicate records spread across spreadsheets and departments.', 'Approvals and handovers that depend on informal messages.', 'Reports assembled manually from inconsistent operational data.'],
    deliverables: ['A workflow and data map with responsibilities, roles and permission requirements.', 'Agreed operations screens, approval flows, reporting and integrations.', 'A migration plan, operating documentation and training for the people who use the system.'],
    process: ['Discovery: document how work moves today and identify the records that should be authoritative.', 'Implementation: build or integrate the agreed workflows; test permissions and reports with representative data.', 'Handover: rehearse key tasks with the team and agree rollout, support and ownership.'],
    limitations: 'Data cleanup, system access and process decisions affect delivery. An ERP engagement is scoped to the workflows agreed with you; it does not imply every department or compliance requirement is covered. No completed ERP client deployment is claimed here.',
    evidence: { label: 'Explore our software approach', href: '/intel', context: 'Our approach combines workflow discovery, implementation and knowledge transfer. Public ERP delivery evidence is still awaiting confirmation.' },
    faqs: [{ question: 'Do we need to replace every system?', answer: 'No. Discovery can identify a narrower workflow or an integration between existing tools. The choice depends on their capabilities and your operating constraints.' }, { question: 'What should we prepare for discovery?', answer: 'Bring representative workflows, current reports, role definitions and the list of systems involved. Avoid sending sensitive operational records in the first contact form.' }],
    related: ['custom-software-development', 'knowledge-transfer'],
  },
  {
    slug: 'ai-development', title: 'Applied AI Development | MZ for Tech',
    heading: 'Applied AI with a defined task and a way to evaluate it.',
    description: 'Apply AI to product and operational problems with MZ for Tech, including task evaluation, specialized models and local inference tradeoffs.',
    intro: 'An AI project starts with the task, the available data and the cost of a wrong answer. MZ helps assess feasibility, compare approaches and build an evaluated system around a specific operational or product need.',
    problems: ['A document or data workflow that needs assistance with extraction or classification.', 'A specialized task that a general model does not handle consistently.', 'Inference costs or deployment constraints that need an alternative to a large remote model.'],
    deliverables: ['A feasibility assessment and evaluation plan tied to the task.', 'An agreed model or AI integration, with test cases and documented limitations.', 'Deployment guidance, monitoring requirements and training on how to use and review outputs.'],
    process: ['Discovery: define the task, review data permissions, and establish a baseline and success criteria.', 'Implementation: compare candidate approaches and evaluate failures as well as aggregate results.', 'Handover: document when human review is required, operating constraints and any agreed support.'],
    limitations: 'AI outputs can be wrong. Accuracy depends on the task and evaluation data. Local deployment requires suitable hardware and model licences. Research results on BloodMNIST do not establish clinical readiness or performance on your data.',
    evidence: { label: 'VGG19 compression experiments on BloodMNIST', href: '/research/papers/vgg19-bloodmnist-compression', context: 'The published experiments document evaluation methods and compression tradeoffs. They are research evidence, rather than a guarantee for a production application.' },
    faqs: [{ question: 'Should we fine-tune a model?', answer: 'Only if evaluation shows a useful reason. A simpler integration, retrieval workflow or non-AI system may solve the task with less operational cost.' }, { question: 'Can the system run locally?', answer: 'We assess model size, hardware, licences and latency needs. Local inference can reduce dependence on remote services, but it still needs maintenance and evaluation.' }],
    related: ['model-optimization', 'custom-software-development'],
  },
  {
    slug: 'model-optimization', title: 'Model Optimization & Local Inference | MZ for Tech',
    heading: 'Model optimization measured against your constraints.',
    description: 'Explore model compression and local inference with MZ for Tech, using measured quality, memory and runtime tradeoffs for the target environment.',
    intro: 'A smaller model is useful only if it still does the job. MZ assesses model optimization against task quality and the intended runtime, drawing on experiments with regularization, structured pruning and low-rank approximation.',
    problems: ['A model that exceeds the memory available on the target device.', 'Inference latency or cost that makes a workflow impractical.', 'A compression result that looks good on average but fails important classes or cases.'],
    deliverables: ['A baseline evaluation of the model and target runtime.', 'Agreed optimization experiments and comparison of task quality, model size and runtime behavior.', 'A documented recommendation, deployment constraints and reproducible evaluation guidance.'],
    process: ['Discovery: establish the dataset, hardware, licence and quality threshold.', 'Implementation: compare optimization candidates using the same evaluation protocol and inspect failure cases.', 'Handover: document the selected tradeoff and how to repeat checks when the model or data changes.'],
    limitations: 'Parameter reduction does not automatically imply faster inference. Gains depend on physical model structure, runtime and hardware. No compression ratio or accuracy improvement is promised before evaluation.',
    evidence: { label: 'Read the VGG19 study and accompanying code', href: '/research/papers/vgg19-bloodmnist-compression', context: 'The study compares L1 regularization, structured L0 gates and SVD on a defined blood-cell classification experiment.' },
    faqs: [{ question: 'Does pruning always reduce latency?', answer: 'No. Masking weights can leave the stored tensor shape unchanged. Runtime measurements on the target hardware are needed to establish useful savings.' }, { question: 'Can research results transfer directly to our model?', answer: 'They can inform experiments, but your architecture, data and runtime need their own evaluation.' }],
    related: ['ai-development', 'knowledge-transfer'],
  },
  {
    slug: 'knowledge-transfer', title: 'Team Training & Knowledge Transfer | MZ for Tech',
    heading: 'Help your team operate what is delivered.',
    description: 'MZ for Tech provides project handover, practical workshops, statistical thinking and data literacy training tailored to team responsibilities.',
    intro: 'Software delivery is more useful when the team can operate it. MZ provides training and workshops around the system, concepts and decisions your team needs to understand, including statistical thinking and data literacy.',
    problems: ['A team dependent on one person to operate a delivered system.', 'Staff who need practical guidance for new workflows or AI tools.', 'Decisions made from metrics without understanding the assumptions behind them.'],
    deliverables: ['A learning scope based on participants’ roles and current familiarity.', 'Practical sessions, examples and reference material for the agreed topics.', 'Handover guidance for recurring tasks, escalation and maintenance ownership.'],
    process: ['Discovery: define participants, responsibilities and the tasks they need to perform.', 'Preparation and delivery: connect the material to real workflows and practice with suitable examples.', 'Handover: review open questions and agree any follow-up support or additional sessions.'],
    limitations: 'Training scope and session format depend on the audience. No accreditation, certification or guaranteed learning outcome is claimed. Workshops do not replace specialist review of high-stakes decisions.',
    evidence: { label: 'The Measure and the Target', href: '/research/essays/the-measure-and-the-target', context: 'Our research essay illustrates the questions behind statistical thinking: what a metric captures and what optimizing it can miss. It is a publication, not a client training testimonial.' },
    faqs: [{ question: 'Can training be part of a software project?', answer: 'Yes. We can scope operational handover alongside implementation so the people responsible for the system practice the tasks they will own.' }, { question: 'Can a workshop be a standalone engagement?', answer: 'Share the audience, starting knowledge and topic. We assess the scope and format before agreeing the engagement.' }],
    related: ['erp-internal-systems', 'ai-development'],
  },
];
