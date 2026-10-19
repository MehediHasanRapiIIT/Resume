<script lang="ts">
  import { contacts, education, experience, moreProjects, profile, projects, skills } from './resume';
</script>

<!-- Hidden on screen; app.css shows it (and hides the OS) under @media print. -->
<div class="print-resume">
  <header>
    <h1>{profile.name}</h1>
    <p>{profile.title} · {profile.location}</p>
    <p>{contacts.map((c) => c.value).join(' · ')}</p>
  </header>

  <h2>Skills</h2>
  {#each skills as group (group.label)}
    <p><strong>{group.label}:</strong> {group.items.join(', ')}</p>
  {/each}

  <h2>Professional Experience</h2>
  {#each experience as job (job.company)}
    <section>
      <h3>{job.role} | {job.company} <span>{job.period}</span></h3>
      <ul>
        {#each job.bullets as bullet (bullet)}
          <li>{bullet}</li>
        {/each}
      </ul>
    </section>
  {/each}

  <h2>Projects</h2>
  {#each projects as project (project.name)}
    <section>
      <h3>{project.name} <span>{project.href.replace('https://', '')}</span></h3>
      <ul>
        {#each project.bullets as bullet (bullet)}
          <li>{bullet}</li>
        {/each}
      </ul>
      <p><strong>Technologies:</strong> {project.tech.join(', ')}</p>
    </section>
  {/each}

  <h2>Other Projects</h2>
  <ul>
    {#each moreProjects as project (project.name)}
      <li><strong>{project.name}</strong>: {project.bullets[0]} <em>({project.tech.join(', ')})</em></li>
    {/each}
  </ul>

  <h2>Education</h2>
  <p>
    <strong>{education.degree}</strong>, {education.school} ({education.period}) · {education.result}
  </p>
  {#each education.earlier as item (item.degree)}
    <p><strong>{item.degree}</strong>, {item.school} ({item.period}) · {item.result}</p>
  {/each}
</div>

<style>
  .print-resume {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 10.5pt;
    line-height: 1.35;
    color: #000;
  }

  header {
    text-align: center;
  }

  h1 {
    margin: 0;
    font-size: 22pt;
  }

  h2 {
    margin: 12pt 0 4pt;
    padding-bottom: 2pt;
    border-bottom: 1px solid #000;
    font-size: 12pt;
  }

  h3 {
    display: flex;
    justify-content: space-between;
    gap: 12pt;
    margin: 6pt 0 2pt;
    font-size: 10.5pt;
  }

  h3 span {
    font-weight: 400;
    font-style: italic;
  }

  p {
    margin: 2pt 0;
  }

  ul {
    margin: 2pt 0;
    padding-left: 14pt;
  }

  section {
    break-inside: avoid-page;
  }
</style>
