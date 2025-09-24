# Matteo's Personal CV Website

A modern, responsive personal CV website built with Astro.js and Tailwind CSS, hosted on AWS with automated CI/CD pipeline.

## 🚀 Features

- **Modern Tech Stack**: Built with Astro.js for optimal performance and SEO
- **Responsive Design**: Fully responsive design using Tailwind CSS
- **AWS Hosting**: Hosted on AWS S3 with CloudFront CDN
- **Automated Deployment**: CI/CD pipeline with AWS CodePipeline and CodeBuild
- **Custom Domain**: Configured for matteo.wtf domain
- **SSL/HTTPS**: Automatic SSL certificate management with AWS Certificate Manager

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Astro.js](https://astro.build/) - Fast, modern static site generator
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **TypeScript**: Type-safe development experience

### Infrastructure & Deployment
- **Cloud Provider**: AWS (Amazon Web Services)
- **Hosting**: S3 Static Website + CloudFront CDN
- **Infrastructure as Code**: AWS CDK (Cloud Development Kit)
- **CI/CD**: AWS CodePipeline + AWS CodeBuild
- **DNS**: Route 53
- **SSL Certificate**: AWS Certificate Manager

## 📁 Project Structure

```
matteo-cv-website/
├── src/
│   ├── components/          # Reusable Astro components
│   │   ├── Header.astro     # Navigation header
│   │   ├── Hero.astro       # Hero section
│   │   ├── About.astro      # About me section
│   │   ├── Experience.astro # Professional experience
│   │   ├── Skills.astro     # Technical skills
│   │   ├── Projects.astro   # Portfolio projects
│   │   ├── Contact.astro    # Contact form and info
│   │   └── Footer.astro     # Site footer
│   ├── layouts/
│   │   └── Layout.astro     # Base layout template
│   ├── pages/
│   │   └── index.astro      # Homepage
│   └── styles/
│       └── global.css       # Global styles and Tailwind imports
├── infrastructure/          # AWS CDK infrastructure code
│   ├── bin/
│   │   └── infrastructure.ts # CDK app entry point
│   ├── lib/
│   │   └── matteo-website-stack.ts # Main infrastructure stack
│   ├── cdk.json            # CDK configuration
│   ├── package.json        # CDK dependencies
│   └── tsconfig.json       # TypeScript config for CDK
├── buildspec.yml           # CodeBuild build specification
├── astro.config.mjs        # Astro configuration
├── tailwind.config.mjs     # Tailwind configuration
└── package.json            # Frontend dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- AWS CLI configured with appropriate permissions
- AWS CDK CLI installed globally: `npm install -g aws-cdk`

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/hpfs74/personal-website.git
   cd personal-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Visit `http://localhost:4321` to see the website

### Building for Production

```bash
npm run build
```

The built site will be in the `dist/` directory.

## 🏗️ Infrastructure Setup

### Deploy Infrastructure

1. **Navigate to infrastructure directory**
   ```bash
   cd infrastructure
   ```

2. **Install CDK dependencies**
   ```bash
   npm install
   ```

3. **Bootstrap CDK (first time only)**
   ```bash
   npx cdk bootstrap
   ```

4. **Deploy the stack**
   ```bash
   npx cdk deploy
   ```

### Infrastructure Components

The CDK stack creates:

- **S3 Bucket**: For static website hosting
- **CloudFront Distribution**: CDN for global content delivery
- **Route 53 Records**: DNS configuration for matteo.wtf
- **SSL Certificate**: Automated SSL/TLS certificate
- **CodePipeline**: Automated deployment pipeline
- **CodeBuild Project**: Build and deployment jobs
- **IAM Roles**: Proper permissions for all services

## 🔄 CI/CD Pipeline

The automated deployment pipeline:

1. **Source**: Monitors GitHub repository for changes to `main` branch
2. **Build**:
   - Installs dependencies with `npm ci`
   - Builds the Astro.js site with `npm run build`
   - Creates deployment artifacts
3. **Deploy**:
   - Uploads built files to S3
   - Invalidates CloudFront cache for immediate updates

### Pipeline Triggers

- **Automatic**: Pushes to `main` branch trigger automatic deployment
- **Manual**: Can be triggered manually from AWS Console

## 🛠️ Available Scripts

### Website Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run astro        # Run Astro CLI commands
```

### Infrastructure Management
```bash
cd infrastructure
npm run build        # Compile TypeScript
npm run watch        # Watch mode for development
npm run cdk          # Run CDK CLI commands
npm run deploy       # Deploy infrastructure
npm run diff         # Show infrastructure changes
npm run synth        # Synthesize CloudFormation template
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file for local development:
```env
# Add any environment-specific variables here
```

### CDK Configuration

The infrastructure can be customized by modifying:
- `infrastructure/bin/infrastructure.ts` - Stack configuration
- `infrastructure/lib/matteo-website-stack.ts` - Resource definitions

### Domain Configuration

To use a different domain:
1. Update the domain in `infrastructure/bin/infrastructure.ts`
2. Ensure Route 53 hosted zone exists for your domain
3. Update GitHub repository references in the CDK stack

## 📞 Contact Information

- **Website**: [matteo.wtf](https://matteo.wtf)
- **Email**: hello@matteo.wtf
- **GitHub**: [github.com/matteo](https://github.com/matteo)

## 📄 License

This project is licensed under the ISC License - see the package.json for details.

---

Built with ❤️ using modern web technologies and AWS cloud infrastructure.