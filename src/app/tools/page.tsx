import { Card } from '@/components/Card'
import { DesignToolLogo } from '@/components/DesignToolLogo'
import { Section } from '@/components/Section'
import { SimpleLayout } from '@/components/SimpleLayout'

function ToolsSection({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Section>) {
  return (
    <Section {...props}>
      <ul role="list" className="space-y-16">
        {children}
      </ul>
    </Section>
  )
}

function Tool({
  title,
  href,
  children,
}: {
  title: string
  href?: string
  children: React.ReactNode
}) {
  return (
    <Card as="li">
      <Card.Title as="h3" href={href}>
        {title}
      </Card.Title>
      <Card.Description>{children}</Card.Description>
    </Card>
  )
}

function DesignTool({
  title,
  href,
  logo,
  children,
}: {
  title: string
  href: string
  logo: string
  children: React.ReactNode
}) {
  return (
    <Card as="li">
      <div className="flex gap-4">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <DesignToolLogo src={logo} />
        </a>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-violet-500 dark:hover:text-violet-400"
            >
              {title}
            </a>
          </h3>
          <Card.Description>{children}</Card.Description>
        </div>
      </div>
    </Card>
  )
}

function WorkstationTool({
  title,
  href,
  image,
  children,
}: {
  title: string
  href?: string
  image: string
  children: React.ReactNode
}) {
  const linkProps = {
    target: '_blank' as const,
    rel: 'noopener noreferrer' as const,
  }

  return (
    <Card as="li">
      <div className="flex gap-4">
        <div className="shrink-0">
          {href ? (
            <a href={href} {...linkProps}>
              <DesignToolLogo src={image} size="md" />
            </a>
          ) : (
            <DesignToolLogo src={image} size="md" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
            {href ? (
              <a
                href={href}
                {...linkProps}
                className="transition hover:text-violet-500 dark:hover:text-violet-400"
              >
                {title}
              </a>
            ) : (
              title
            )}
          </h3>
          <Card.Description>{children}</Card.Description>
        </div>
      </div>
    </Card>
  )
}

export const metadata = {
  title: 'Tools',
  description: 'Software I use, gadgets I love, and other things I recommend.',
}

export default function Tools() {
  return (
    <SimpleLayout
      title="Software I use, gadgets I love, and other things I recommend."
      intro="I get asked a lot about the things I use to build software, stay productive, or buy to fool myself into thinking I'm being productive when I'm really just procrastinating. Here's a big list of all of my favorite stuff."
    >
      <div className="space-y-0">
        <ToolsSection title="Workstation">
          <WorkstationTool
            title="Custom-Built Uplift Standing Desk"
            image="https://www.google.com/s2/favicons?domain=upliftdesk.com&sz=128"
          >
            A custom-built standing desk from Uplift Desk. Lets me switch
            between sitting and standing throughout the day for better posture
            and energy.
          </WorkstationTool>
          <WorkstationTool
            title='16" MacBook Pro, M1 Max, 64GB RAM (2021)'
            image="https://www.google.com/s2/favicons?domain=apple.com&sz=128"
          >
            I was using an Intel-based 16" MacBook Pro prior to this and the
            difference is night and day. I've never heard the fans turn on a
            single time, even under the incredibly heavy loads I put it through
            with our various launch simulations.
          </WorkstationTool>
          <WorkstationTool
            title='Dual Samsung 27" Curved Gaming Monitors (CJG52)'
            href="https://www.amazon.ca/Samsung-LC27JG52QQNXZA-Curved-Gaming-Monitor/dp/B07H2MXZ37"
            image="https://www.google.com/s2/favicons?domain=samsung.com&sz=128"
          >
            Two Samsung CJG52 curved 27" WQHD monitors (2560×1440, 144Hz) for
            expanded workspace and smooth visuals. The 1800R curvature and VA
            panel deliver deep blacks and rich colors—great for both coding and
            keeping an eye on multiple things at once.
          </WorkstationTool>
          <WorkstationTool
            title="Ergodriven Om Vertical Handshake Mouse"
            href="https://ergodriven.com/products/the-vertical-handshake-mouse"
            image="https://www.google.com/s2/favicons?domain=ergodriven.com&sz=128"
          >
            A vertical mouse that puts my wrist in a natural handshake position
            instead of twisting it flat. Reduces tension and fatigue during long
            coding sessions, with programmable buttons and an onboard screen for
            DPI and battery level.
          </WorkstationTool>
          <WorkstationTool
            title="Satechi Slim X3 Bluetooth Backlit Keyboard"
            href="https://www.amazon.ca/Satechi-Slim-Bluetooth-Backlit-Keyboard/dp/B08Q5R3X1N"
            image="https://www.google.com/s2/favicons?domain=satechi.com&sz=128"
          >
            Full-size wireless keyboard with numeric pad, multi-device Bluetooth
            (up to 4 devices), and backlit keys with 10 brightness levels. The
            aluminum finish matches my Apple setup, and the low-profile keys
            make for comfortable all-day typing without sacrificing the desk
            space.
          </WorkstationTool>
          <WorkstationTool
            title="Herman Miller Sayl Chair"
            href="https://www.hermanmiller.com/products/seating/office-chairs/sayl-chairs/"
            image="https://www.google.com/s2/favicons?domain=hermanmiller.com&sz=128"
          >
            Designed by Yves Béhar with a distinctive suspension back. Fewer
            parts, less material, and still everything a good chair should
            be—supportive, comfortable, and built to last. If I'm going to
            slouch in the worst ergonomic position imaginable all day, I might
            as well do it in a well-designed chair.
          </WorkstationTool>
          <WorkstationTool
            title="Audio-Technica AT2020 Condenser Microphone"
            href="https://www.amazon.ca/audio-technica-AT2020-Condenser-Microphone-Applications/dp/B0006H92QK"
            image="https://www.google.com/s2/favicons?domain=audio-technica.com&sz=128"
          >
            Cardioid condenser studio mic—the price/performance standard for
            project and home studio use. Great for podcasts, video calls, and
            voiceover. Requires phantom power (48V), which the Yamaha mixer
            provides.
          </WorkstationTool>
          <WorkstationTool
            title="Yamaha AG06 6-Channel Mixer"
            href="https://www.amazon.ca/Yamaha-AG06-6-Channel-Mixer-Microphone/dp/B00TY8JFSC"
            image="https://www.google.com/s2/favicons?domain=yamaha.com&sz=128"
          >
            Compact 6-channel mixer and USB audio interface with phantom power
            for condenser mics. Use it for streaming, podcasting, and recording—
            the loopback function is perfect for mixing mic input with system
            audio. Clean D-PRE preamps and 1-touch DSP for compression, EQ, and
            reverb.
          </WorkstationTool>
        </ToolsSection>
        <hr className="my-20 border-0 border-t border-zinc-200 dark:border-zinc-700/40" />
        <ToolsSection title="Development tools">
          <WorkstationTool
            title="Cursor"
            href="https://cursor.com"
            image="https://www.google.com/s2/favicons?domain=cursor.com&sz=128"
          >
            My primary IDE—combines the best of VS Code with AI-powered
            assistance for coding faster and smarter.
          </WorkstationTool>
          <WorkstationTool
            title="Claude"
            href="https://claude.ai"
            image="https://www.google.com/s2/favicons?domain=anthropic.com&sz=128"
          >
            AI assistant that helps me think through problems, draft code, and
            iterate on ideas throughout the development process.
          </WorkstationTool>
          <WorkstationTool
            title="GitHub"
            href="https://github.com"
            image="https://www.google.com/s2/favicons?domain=github.com&sz=128"
          >
            Where all my code lives. Essential for version control,
            collaboration, and CI/CD.
          </WorkstationTool>
          <WorkstationTool
            title="VS Code"
            href="https://code.visualstudio.com"
            image="https://www.google.com/s2/favicons?domain=code.visualstudio.com&sz=128"
          >
            Lightweight, extensible editor I reach for when I need something
            quick or when working outside of Cursor.
          </WorkstationTool>
          <WorkstationTool
            title="iTerm2"
            href="https://iterm2.com"
            image="https://www.google.com/s2/favicons?domain=iterm2.com&sz=128"
          >
            I'm honestly not even sure what features I get with this that aren't
            just part of the macOS Terminal but it's what I use.
          </WorkstationTool>
        </ToolsSection>
        <hr className="my-20 border-0 border-t border-zinc-200 dark:border-zinc-700/40" />
        <ToolsSection title="Design">
          <WorkstationTool
            title="Figma"
            href="https://figma.com"
            image="https://www.google.com/s2/favicons?domain=figma.com&sz=128"
          >
            We started using Figma as just a design tool but now it's become our
            virtual whiteboard for the entire company. Never would have expected
            the collaboration features to be the real hook.
          </WorkstationTool>
          <DesignTool
            title="Dribbble"
            href="https://dribbble.com/"
            logo="https://www.google.com/s2/favicons?domain=dribbble.com&sz=128"
          >
            Getting inspired by the work of talented designers from around the
            world.
          </DesignTool>
          <DesignTool
            title="Unsplash"
            href="https://unsplash.com/"
            logo="https://images.unsplash.com/unsplash-logo?w=64&fm=png&fit=max"
          >
            Inspiring and free-to-use imagery for projects and mockups.
          </DesignTool>
          <DesignTool
            title="Midjourney"
            href="https://www.midjourney.com/"
            logo="https://www.google.com/s2/favicons?domain=midjourney.com&sz=128"
          >
            Concept and image generation for exploring visual ideas quickly.
          </DesignTool>
          <DesignTool
            title="Google AI Studio"
            href="https://aistudio.google.com/"
            logo="https://www.google.com/s2/favicons?domain=aistudio.google.com&sz=128"
          >
            Concept and image generation with Google's AI models.
          </DesignTool>
          <DesignTool
            title="Higgsfield"
            href="https://higgsfield.ai/"
            logo="https://www.google.com/s2/favicons?domain=higgsfield.ai&sz=128"
          >
            AI video and image generation for creative projects.
          </DesignTool>
          <DesignTool
            title="CapCut"
            href="https://www.capcut.com/"
            logo="https://www.google.com/s2/favicons?domain=capcut.com&sz=128"
          >
            Video editing with AI-powered tools for quick, polished results.
          </DesignTool>
          <DesignTool
            title="Screen Studio"
            href="https://screen.studio/"
            logo="https://www.google.com/s2/favicons?domain=screen.studio&sz=128"
          >
            Great tutorials and feature release videos with automatic zoom and
            smooth cursor tracking.
          </DesignTool>
        </ToolsSection>
        <hr className="my-20 border-0 border-t border-zinc-200 dark:border-zinc-700/40" />
        <ToolsSection title="Productivity">
          <WorkstationTool
            title="Linear"
            href="https://linear.app"
            image="https://www.google.com/s2/favicons?domain=linear.app&sz=128"
          >
            Issue tracking and project management that stays out of the way. Fast,
            keyboard-driven, and makes shipping software feel effortless.
          </WorkstationTool>
          <WorkstationTool
            title="Slack"
            href="https://slack.com"
            image="https://www.google.com/s2/favicons?domain=slack.com&sz=128"
          >
            Where team communication happens. Channels, threads, and integrations
            keep everyone aligned without the email overload.
          </WorkstationTool>
          <WorkstationTool
            title="Calendly"
            href="https://calendly.com"
            image="https://www.google.com/s2/favicons?domain=calendly.com&sz=128"
          >
            Scheduling meetings without the back-and-forth. Share availability,
            let people pick a time, and keep my calendar under control.
          </WorkstationTool>
          <WorkstationTool
            title="Google Calendar"
            href="https://calendar.google.com"
            image="https://www.google.com/s2/favicons?domain=google.com&sz=128"
          >
            The backbone of my schedule. Syncs everywhere and keeps work,
            meetings, and life in one place.
          </WorkstationTool>
        </ToolsSection>
      </div>
    </SimpleLayout>
  )
}
