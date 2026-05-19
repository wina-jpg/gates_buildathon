import type { HiringOutlookData } from '../types'

export const MOCK_OUTLOOK: HiringOutlookData = {
  competitorsSubtitle: 'This is how similar companies are hiring for these roles.',
  candidatePool: {
    count: '300k',
    label: 'Potential candidates',
    benchmark: '10k',
    summary:
      'Your JD is realistic to the experience and skills of modern job seekers',
  },
  stars: {
    subtitle:
      'Removing degree requirements expands opportunities for skilled candidates without traditional credentials.',
    summary:
      'Your JD is accessible to people who are Skilled Through Alternative Pathways',
  },
  timeToHire: {
    range: '12–14 weeks',
    label: 'Est. time to hire',
    benchmark: 'A great turnaround for hiring is between 6–8 weeks',
    summary:
      'It might take more time to source and hire based on current trends',
  },
  competitors: [
    {
      id: 'globex-platform',
      company: 'Globex Analytics',
      title: 'Staff Platform Engineer',
      text: 'Hybrid 3 days/week in Austin. Own Kubernetes platform on GCP. 7+ years required. CS degree preferred. On-call rotation required.',
      potentialCandidates: [
        'Maya Chen (synthetic) — EKS migrations, 7 yrs Python',
        'Jordan Lee (synthetic) — CI/CD, internal platforms, 5 yrs',
      ],
    },
    {
      id: 'initech-sre',
      company: 'Initech Cloud',
      title: 'Senior SRE',
      text: 'On-site in NYC. Manage AWS EKS and Terraform at scale. Strong Python and Go. 24/7 pager duty. Competitive salary + bonus.',
      potentialCandidates: [
        'Alex Rivera (synthetic) — SRE on-call lead, 9 yrs',
        'Maya Chen (synthetic) — Terraform, Kubernetes, mentoring',
      ],
    },
    {
      id: 'umbrella-data',
      company: 'Umbrella Data Co',
      title: 'Platform Engineer II',
      text: 'Remote US. Build internal developer portal and CI/CD. Python, Docker, K8s. 4+ years. Emphasis on cost optimization and observability.',
      potentialCandidates: [
        'Jordan Lee (synthetic) — dev portals, Python automation',
        'Sam Okonkwo (synthetic) — FinOps, K8s autoscaling, 4 yrs',
      ],
    },
  ],
}
