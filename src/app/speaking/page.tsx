import { type Metadata } from 'next'

import { Card } from '@/components/Card'
import { Section } from '@/components/Section'
import { SimpleLayout } from '@/components/SimpleLayout'

function SpeakingSection({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Section>) {
  return (
    <Section {...props}>
      <div className="space-y-16">{children}</div>
    </Section>
  )
}

function Appearance({
  title,
  description,
  event,
  cta,
  href,
}: {
  title: string
  description: string
  event: string
  cta: string
  href: string
}) {
  return (
    <Card as="article">
      <Card.Title as="h3" href={href}>
        {title}
      </Card.Title>
      <Card.Eyebrow decorate>{event}</Card.Eyebrow>
      <Card.Description>{description}</Card.Description>
      <Card.Cta>{cta}</Card.Cta>
    </Card>
  )
}

export const metadata: Metadata = {
  title: 'Speaking',
  description:
    "I've spoken at events all around the world and been interviewed for many podcasts.",
  openGraph: {
    title: 'Speaking - Eric Kryski',
    description:
      "I've spoken at events all around the world and been interviewed for many podcasts.",
    url: '/speaking',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Speaking - Eric Kryski',
    description:
      "I've spoken at events all around the world and been interviewed for many podcasts.",
  },
}

export default function Speaking() {
  return (
    <SimpleLayout
      title="I've spoken at events all around the world and been interviewed for many podcasts."
      intro="One of my favorite ways to share my ideas is live on stage, where there's so much more communication bandwidth than there is in writing, and I love podcast interviews because they give me the opportunity to answer questions instead of just present my opinions."
    >
      <div className="space-y-20">
        <SpeakingSection title="World Economic Forum">
          <Appearance
            href="https://www.bidali.com/blog/bidali-in-bermuda-2020-03-05"
            title="The future of money at Davos"
            description="Spoke on multiple panels at the World Economic Forum in Davos about the future of money, cryptocurrency, stablecoins, and digital payments—including at Digital Davos and CV Labs. The trip also included the chance to meet one of my idols, Ray Dalio, in person. Preceded my presentation to Bermuda's government and key stakeholders on Bidali's payment infrastructure."
            event="World Economic Forum, January 2020"
            cta="Read more"
          />
        </SpeakingSection>

        <SpeakingSection title="House of Commons">
          <Appearance
            href="https://www.ourcommons.ca/documentviewer/en/43-1/INDU/meeting-20/evidence"
            title="Canada's Response to the COVID-19 Pandemic"
            description="Testified before the Standing Committee on Industry, Science and Technology on supporting Canadian tech startups, angel investment, and economic recovery. Presented Bidali's perspective on blockchain payments and stimulus effectiveness."
            event="INDU Committee, June 1, 2020"
            cta="View testimony"
          />
          <Appearance
            href="https://www.noscommunes.ca/committees/en/INDU/StudyActivity?studyActivityId=11876097"
            title="Blockchain Technology Study"
            description="Advised industry stakeholders and Canadian MPs, and assisted with preparing remarks for committee meetings on blockchain technology, cryptocurrencies, and digital assets."
            event="INDU Committee, 2022–2023"
            cta="View study"
          />
        </SpeakingSection>

        <SpeakingSection title="Conferences">
          <Appearance
            href="https://www.youtube.com/watch?v=ml9QdXJQXwY"
            title="Panel at Bermuda FinTech conference"
            description="Participated in a panel discussion on digital payments and the future of finance at a Bermuda conference, following my presentation to the island's Premier and key stakeholders on Bidali's payment infrastructure."
            event="Bermuda"
            cta="Watch video"
          />
          <Appearance
            href="https://www.youtube.com/watch?v=iGgU9luLyYw"
            title="Canadian Blockchain Consortium Panel"
            description="Panel discussion on blockchain technology, digital assets, and the Canadian crypto ecosystem."
            event="Canadian Blockchain Consortium"
            cta="Watch video"
          />
          <Appearance
            href="https://www.youtube.com/watch?v=Zy4WQmVkD5o"
            title="Virtual panel at Stellar Meridian"
            description="Participated in a virtual panel at Stellar's annual Meridian conference, discussing payments, interoperability, and the future of digital assets."
            event="Stellar Meridian Conference"
            cta="Watch video"
          />
        </SpeakingSection>

        <SpeakingSection title="Real Vision Cryptoverse">
          <Appearance
            href="https://www.youtube.com/watch?v=nLzA69ro5NI"
            title="Bidali: Next Generation Payments and Gift Cards"
            description="Joined Ash Bennington to discuss Bidali, crypto adoption, and barriers to transferring value. Explains Bidali's vision to create the world's first user-owned bank and payments network."
            event="Real Vision Cryptoverse, March 2021"
            cta="Watch video"
          />
          <Appearance
            href="https://www.youtube.com/watch?v=-Wm1n2qzFxs"
            title="Erik Voorhees: The Case for the Decentralization of Business and Money"
            description="Hosted Erik Voorhees, CEO of ShapeShift, for a discussion on decentralizing business and money—whether it's time to separate money from state."
            event="Real Vision Cryptoverse, July 2021"
            cta="Watch video"
          />
          <Appearance
            href="https://www.youtube.com/watch?v=HL_QR5SPEqY"
            title="Cosmos: Creating the Toolkit for Interoperable Networks"
            description="Interviewed Ethan Buchman, co-founder of Cosmos, on interoperable blockchains, localized economies, and municipal sovereignty."
            event="Real Vision Cryptoverse, May 2021"
            cta="Watch video"
          />
          <Appearance
            href="https://www.youtube.com/watch?v=V-SQA00Fhpk"
            title="Celo, Stablecoin Classifications and Their Use Cases"
            description="Interview with Rene Reinsberg on Celo, stablecoin classifications, and their use cases."
            event="Real Vision Cryptoverse"
            cta="Watch video"
          />
        </SpeakingSection>

        <SpeakingSection title="Podcasts">
          <Appearance
            href="https://www.youtube.com/watch?v=GPDut8ls46c"
            title="Thin Air Labs Interview"
            description="Conversation with Thin Air Labs on building Bidali, crypto payments, and the Calgary tech ecosystem."
            event="Thin Air Labs"
            cta="Listen to podcast"
          />
          <Appearance
            href="https://www.youtube.com/watch?v=4Kjr9CSuES8"
            title="Sam Connor Podcast"
            description="Podcast with Sam Connor, Head of Ecosystem Development at Circle, on stablecoins, payments, and the digital asset ecosystem."
            event="Sam Connor (Circle)"
            cta="Listen to podcast"
          />
          <Appearance
            href="https://www.youtube.com/watch?v=eusjkx7CLGE"
            title="Ameer Rosic Podcast"
            description="Discussion with Ameer Rosic on blockchain, cryptocurrency adoption, and building in the digital assets space. Includes a special deep dive into Facebook's Libra cryptocurrency and its viability and challenges."
            event="Ameer Rosic"
            cta="Listen to podcast"
          />
        </SpeakingSection>

        <SpeakingSection title="Interviews">
          <Appearance
            href="https://www.highlinebeta.com/blog/innovation-in-payments-interview-with-eric-kryski-co-founder-at-bidali"
            title="Innovation in Payments: Interview with Eric Kryski"
            description="Conversation with Highline Beta about the future of payments post-COVID-19, cryptocurrency adoption, gift cards, and how Bidali helps businesses increase sales and eliminate fraud with next-generation payments."
            event="Highline Beta"
            cta="Read interview"
          />
        </SpeakingSection>

        <SpeakingSection title="Developer Meetups">
          <Appearance
            href="https://www.youtube.com/watch?v=Hq4u10NIxdo"
            title="NW.js and Electron: Building Desktop Apps with JavaScript"
            description="Session covering NW.js (formerly Node Webkit) and Electron (formerly Atom Shell)—their differences, apps that use this tech, and building a sample app with Electron."
            event="YYC.js"
            cta="Watch video"
          />
          <Appearance
            href="https://www.youtube.com/watch?v=wCv6oJ0urxI"
            title="Real-Time Microservices with Crossbar.io and WAMP"
            description="Collaboration session with Calgary Python (PyYYC) on building real-time microservice applications using Crossbar.io—an open-source broker for RPC and Pub/Sub messaging via the Web Application Messaging Protocol (WAMP)."
            event="YYC.js (with PyYYC)"
            cta="Watch video"
          />
        </SpeakingSection>
      </div>
    </SimpleLayout>
  )
}
