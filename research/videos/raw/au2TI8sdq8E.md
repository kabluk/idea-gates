# Google Just Fixed AI Design By Releasing This

- URL: https://www.youtube.com/watch?v=au2TI8sdq8E
- Channel: AI LABS
- Duration: 13:47
- Views: 56422
- Uploaded: 20261013
- Captions: en (auto-generated)
- Fetched: 2026-10-16

## Description

AI design just got better: Google Stitch now runs in your terminal, so Claude Code can design with AI for you. Here's our full Claude design workflow for Claude AI website design, plus Claude motion design with scroll animations and review skills that make motion design with AI easier on the eyes.

Thanks to Wispr Flow for sponsoring. Get a month of Wispr Flow Pro with unlimited words at https://ref.wisprflow.ai/ai-labs-yt and spend less time typing prompts and more time building.

Community with All Resources: https://ailabspro.io/?v=au2TI8sdq8E

The Roundup, our daily newsletter covering the AI stories that matter. Join now: https://www.theroundup.so/

Got a software idea but don't have the team to build it? Autometa turns your ideas into production-ready software. Check out https://autometa.dev/yt to see what we can build for you.

Resources used in this video:
Stitch CLI install commands: https://stitchprompt.com/blog/google-stitch-cli-tutorial
Scrollytelling skill: https://github.com/doodledood/claude-code-plugins/blob/HEAD/claude-plugins/frontend-design/skills/scrollytelling/SKILL.md

In this video, we show you how to use Google Stitch's new CLI with Claude Code to build a complete website that tells its story as you scroll. Then we explain every step so you can build one too.

Stitch is Google's AI design app. It uses Gemini models to create designs for mobile apps and websites, and its designs are much more refined than what those models make on their own. It also has Google's image generation model built in, so it can make images for your designs. The problem was that Stitch was only a design app. You had to prompt it yourself and then export the designs to your coding agent. Stitch did release an MCP, but setting it up took a lot of steps on Google Cloud. With the new CLI, Claude Code can prompt Stitch directly, the setup is much easier, and it uses fewer tokens because Claude only reads the Stitch skill when it needs it.

Claude can use skills and Stitch can't. So when Claude Code is the one prompting Stitch, you can build a whole AI system design around it. Here's the agentic AI system design we used for AI web design:

1. Prepare the project. Install the Stitch CLI, log in with your Google account, and add the Stitch skill to the .claude folder so Claude can actually load it. Then add the Scrollytelling skill for scroll stories and animation.
2. Write the brief. Claude interviews you about your site and writes everything into brief.md. Every Stitch prompt comes from that same brief, so your designs stay consistent.
3. Design the site in Stitch. Claude prompts Stitch for several versions, checks each one, and asks for a better one whenever it finds a problem. In our case it went through eight designs.
4. Bring the design into your project. Stitch hands each design to Claude as a web page plus a picture of it, and Claude builds the real site from them.
5. Review the site against the design. Our Stitch Review skill compares the site with the original design and takes screenshots at computer, tablet, and phone sizes, so the site doesn't break on smaller screens.
6. Add the scroll animations. The Scrollytelling skill turned the still site into a motion graphic experience: a shake when the rocket launches, stars that streak past as you scroll, a chapter marker, a timeline that moves sideways, and numbers that scramble at each new chapter.
7. Review the story and motion. Our Story Review skill judges the site like the best-designed sites on Awwwards and checks the story, the animations, the pacing, and the writing. After the fixes, the animations were smoother and there were fewer stars, so the site was easier on the eyes.

Whether you come from graphic design, web design, or no design background at all, this workflow shows how website design AI tools and Claude design skills work together. Web design AI no longer has to look like everyone else's, and Claude AI website design can go well past a still mockup into real Claude motion design.

All the skills we created in this video, along with other resources, are available in AI Labs Pro.

0:00 Intro
1:00 What Is Stitch
2:44 Setup
5:00 Writing the Brief
6:17 Generating Designs
7:43 Sponsor
8:34 Building the Site
9:25 Stitch Review
10:58 Scroll Animations
12:05 Story Review

Hashtags:
#ClaudeDesign #MotionDesign #GraphicDesign #MotionGraphic #Design #WebDesign #ClaudeMotionDesign #AIDesign

## Transcript

[00:00] Stitch is one of the top design tools out there, and Google has now fixed the one thing that made it hard to use with agents. Stitch now works right from your terminal, so AI agents like Claude code can design your site in Stitch for you. Using the two together made designing so much better, and your designs don't look like everyone else's anymore. So, we built a whole workflow around Claude code and Stitch and used it to make a complete site. That workflow combines Stitch's own tools with another skill that makes the site feel immersive, but the site still had problems that Claude and Stitch didn't notice on their own.

[00:32] That's why the workflow has a step that catches those problems before the site is done. So, if you're new here, we're a software company, and this is our channel AI labs. And in this video, we're going to show you how to use Stitch's new update to build a design and then explain every step in detail so that you can also build a site like this as well. Now, [snorts] this section is about what Stitch is and how to use it. So, if you already know that, you can skip ahead directly to the workflow using the timestamp in the description down below. Stitch is basically a design product by Google that we've been using a lot in our previous videos. It uses

[01:05] Gemini models to generate designs for both your mobile apps and websites, and its designs are much more refined than what these models make on their own. It also has Google's image generation model built in, so it can use that directly to generate images to add in your designs. It has a lot of features like importing design.md files from other sites and trying different versions from the same prompt. But, the problem with Stitch was that it was only a design app. So, you had to open it and prompt it yourself and then export the designs to the coding agent you were building your app with. Stitch did release an MCP, so

[01:38] agents could prompt it, but setting it up took a lot of steps on Google Cloud. To make the setup easier, Google has released a CLI tool for Stitch, so agents can now use it without having to go through the Google Cloud setup. This CLI is much easier to set up, and we'll show you how in a bit. It also uses fewer tokens because Claude only loads the tool into context when it actually needs it, unlike MCP, which stays in the context all the time. Just so you know, you can still use Stitch on its own as well. You just need to open it and choose between mobile and web. Then you tell it what you want to build. Stitch handles the rest and builds the design

[02:11] from your prompt. If you don't like the design, you can click on it and ask Stitch to change it or make a few more versions of it. And when the design looks right, you can download it as code and build your site from it. But if you're following this workflow, you won't need to prompt Stitch yourself because we're going to have Claude code prompt Stitch through its CLI and build the designs. Using Claude code to prompt Stitch is better because Stitch doesn't let you use skills, but Claude does. So, you can build a whole workflow around Stitch that uses your skills and other tools. That's why we're also using a few other skills to build a whole site from start to end. So, the first step of that

[02:44] workflow is to get the project ready for the kind of site we wanted it to build. And for that, let's take this site as an example. To build a site like this, the first thing you need to do is install Stitch's CLI. To install it, you just need to copy the install command and run it in your terminal. Once Stitch is installed, you need to run the login command, which opens a browser where you log into your Google account. Once you do that, you're logged into Stitch and you can use its tools. But being logged in isn't enough on its own because your agent doesn't know Stitch's new tool exists just by installing it. To tell it how to use this tool, you need to add

[03:17] the Stitch skill, which tells your agent the tool is there and how to use it well. You can install the skill with the install command, but you also need to mention the dot Claude folder along with the command as well. That's because Claude only loads skills from the dot Claude folder, but the command puts the skill in a different folder that Claude doesn't look at. So, if you don't mention the dot Claude folder, it won't be able to load skill when you prompt it and would only look for it when you ask it in your prompt. So, with that part added, once you run the command, the Stitch skill is now in the dot Claude folder in your project. This skill has guides that the agent reads. There's a

[03:51] guide on design.md and Stitch uses that file to keep the colors and fonts the same in every design. There's also a list of design words that turns our simple prompts into detailed ones. Along with these guides, the skill has a workflow that writes the design.md file and keeps it matched with your Stitch project and another that checks your running site against the design.md file. With the Stitch skill installed, you also need to add one more skill. That's because we were building a site that tells its story as you scroll and Claude and Stitch can't do that on their own. So, we added a skill called

[04:22] scroll-telling and it has the steps for building these scroll stories, which makes the site much better. It covers the scroll effects this kind of site needs along with a detailed guide on animation. And we added the scroll-telling skill from the start because Claude code would be the one prompting Stitch and we wanted those prompts to use the skill. After the install, the scroll-telling skill is in the same dot Claude folder as the Stitch skill. So, both skills are ready for Claude code when it starts prompting Stitch. But, before we move on to the next step, it would be great if you subscribe to the channel and hit the hype button. This small gesture of

[04:54] support goes a long way for us. Now, with the scroll-telling skill ready, there's one more step you need to take before you build the site. Because Claude code is the one prompting Stitch, so Claude needs the whole idea of the site written down along with the order of the story the site tells as you scroll. That way, every time Claude prompts Stitch, Claude knows exactly what to ask for. And writing the idea down also helps with the problem Stitch has. Because Stitch's style changes from one design to the next, so the designs don't always match. But, when every prompt comes from one written idea, all the designs end up following it. So, the

[05:26] next step is to ask Claude code to write that idea into a file called brief.md. To do that, you need to tell it about the site you want to build and ask to interview you about it. In our prompt, we also told it to keep asking questions until it fully understood the idea and had nothing left to ask with a few options to choose from for each question. That way, you plan the site together, and every answer goes into brief.md. So, when you send that prompt, Claude starts asking things like what story the site should tell and how it should feel, along with what the site is really for. When Claude has nothing left

[05:59] to ask, it writes brief.md and saves it in your project folder. That brief opens with a short summary and then explains the whole story of the site step by step, along with every other detail that shapes the site. Once that's done, Claude has what it needs to start prompting Stitch for the designs, so you can move on to the next step. Now, your [snorts] brief is ready, and the next step is to use Stitch to create your designs. To do that, you need to ask Claude to prompt Stitch and tell it to use brief.md as its guide. You also need to tell it to create several different versions of the design, so you can pick the one that's closest to what you want.

[06:32] When you send that prompt, Claude starts by loading the Stitch skill we installed and reading all of its instructions. First, it creates a project in Stitch and sends it the description from brief.md. Then, it asks Stitch for different versions and checks each design. If Claude finds a problem with the design, Claude prompts Stitch again for a better one. Because Claude keeps checking and fixing the designs, this whole step takes a long time. But, when you open Stitch, you'll see a whole set of designs for your site. They're all versions of the same design and each fixing the issue there was in a previous version. In our case, Claude made eight designs because every time Claude found

[07:05] a problem with a design, it asked Stitch for a new one. So, Claude keeps trying new versions until the design is good enough. When those designs are ready, you can preview each one right inside Stitch to see how it looks before you build anything. The preview shows how the design looks on both a computer screen and a phone. But, the design in Stitch isn't animated and it's just still images with no scrolling effects. That's because we'll be adding the animations later in Claude code. So, if a design isn't good enough, ask Claude to prompt Stitch again and keep improving it until it's the one you want. Once you're happy with the

[07:37] designs, the next step is to add them to your project, so Claude code can build the real site from them. But first, let's have a word by our sponsor, WhisperFlow. If you build with AI, you're typing prompts into Claude and Cursor all day, and typing is the slow part. WhisperFlow is a voice-to-text tool that lets you just talk instead, and it turns the way you naturally speak into clean, ready to send text prompts right inside the apps you already use. We used it in Claude and Cursor with no setup and nothing to switch on. The real magic is what it does with a messy voice. We rattled off a long prompt, changed our mind halfway through, let a

[08:11] few filler words slip in, and WhisperFlow cleaned all of it up, kept the correction, and even spelled our library and function names right. The stuff built-in dictation always butchers. A prompt that would have taken 2 minutes to type was done in about 20 seconds. WhisperFlow is free to use, and our link gets you a month of WhisperFlow Pro with unlimited words. The link and code are in the description and pinned comment. So, once [snorts] the design and Stitch is done, it's finally time to turn it into a real site. To do that, you just ask Claude Code that design into your project. And that part is easy because Stitch is new tool can already

[08:45] hand each design to Claude Code as a web page plus a picture of it, and it can read both. So, once you ask Claude to build the site, it uses the Stitch tool to download every design along with its images and fonts. After that, it starts building the site in your project. Then, when Claude is done building, when you open the site in your browser, and you'll see that the design you previewed in Stitch is now there on the site. But at this point, the site will probably also have a few small animations that weren't in the Stitch design, like images that zoom in a little. These come from Claude because it usually adds

[09:17] simple animations like these on its own. But these small animations aren't the big scroll animations we were aiming for. So, we'll add those big ones later. Now, before we add the animations that tell the story as you scroll, there's one more thing you need to do, and that is review the site against the design. You need this review because the site Claude built from the Stitch design might be missing something, even if it looks good enough at first. When we were testing this, the sites Claude built from Stitch designs looked good on a computer, but they broke on a phone. That's because Stitch made our design for a computer screen only. So, nothing had checked how the site looks on a

[09:50] phone. So, to fix that, we had Claude make a Stitch review skill for us. The skill checks the site Claude built against the original design in Stitch, and it also checks that the site works on phones and tablets. To check those smaller screens, the skill takes screenshots of the site at different screen sizes. That way, Claude can see how the site looks on every screen, not just on a computer. We also added a link to the Stitch review skill in the projects claude.md file. So, wherever you run the review, it knows which project to check against. With that ready, we ran the Stitch review command. Claude loaded the Stitch review skill

[10:23] and got the original design from Stitch. Then, it took screenshots to see how the site looked. At the end, Claude gave us a report. The report covered every screen size and listed the problems with the worst ones first. So, we asked Claude to fix all of those problems, and it updated the site so it matched the design more closely and looked better. That's why this review step is really important. It makes sure the site Claude built matches the original design. But, the review only checks how the site looks, not how it behaves, so it can't tell us if something will go wrong later. We'll check that once the site starts moving. So, the next step is

[10:55] adding the scroll animations. So, now it's finally time to make the site move, and you might remember that we installed the scroll-y telling skill at the start. That skill tells Claude how to make things move and appear as you scroll. So, the site tells its story one step at a time. So, that's the skill we use. We asked Claude code to use the scroll-y telling skill to build the animations, and Claude carefully changed every part of the site and made the still site move. This task actually takes a really long time, but when Claude was done, the whole site had changed, and each part of the story now flowed smoothly into the

[11:27] next. To get there, Claude used images and movement like a shake at the start, so the whole site feels like a trip through space. It also made the stars in the background of our space site streak past whenever you scroll. Along with the stars, Claude added a marker that shows which chapter of the story you're on. Then, in the timeline part of the page, the page moves sideways as you scroll, even though the rest of the site moves up and down. Neither of these was in the version before the animations. And since we had already made sure the design worked on every screen size in the review step, all of these animations also worked on phones and tablets, not

[12:01] just on a computer. But, working on every screen doesn't mean the site looks right. So, once your animations are done, you need to check them carefully. Because Claude tends to add a lot of animations, and too many animations can be hard on the eyes, even when each one looks good on its own. We saw this with the stars Claude made. They looked good, but when we scrolled fast, so many stars flew by that it was too much to look at. To fix that, we had Claude make another review skill called story review. The first review checked that the site matched the stitch design, but the story review skill checks if the site is actually good. To do that, it checks

[12:33] that the story flows from one part to the next, and that every animation helps tell the story. It also checks how fast things happen as you scroll, and whether the words on the site read well. Then, it judges all of that against the idea we wrote in brief.md at the start. And we told the story review skill to be really tough on the site and judge it like the best design sites on awards. Once the story review skill is done, it gives you a report with every problem it found. For each part of the story, the report says if that part works or needs more work. Then, it sorts the problems by how serious they are, so the worst ones come first. So, you can then ask

[13:06] Claude to fix all of those problems, and Claude starts making the changes. When Claude finishes, you'll see a big difference in how the site looks and moves. The animations are smoother and don't jump as much, and there are fewer stars, so the site is much easier on the eyes. Now, all the skills we created in this video, along with other resources, are all available in AI Labs Pro, which is our community. So, if you found value in what we do and want to support the channel, this is the best way to do it. The link's in the description. That brings us to the end of this video. If you'd like to support the channel and help us keep making videos like this,

[13:39] you can do so by using the Super Thanks button below. As always, thank you for watching and I'll see you in the next one.
