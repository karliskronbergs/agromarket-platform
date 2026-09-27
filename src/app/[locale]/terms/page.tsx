import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service — Agromarket",
};

const CONTACT_EMAIL = "info@lauks24.lv";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (locale === "lv") {
    return (
      <LegalPage title="Lietošanas noteikumi" updated="Pēdējie labojumi: 2026. gada septembris">
        <LegalSection title="1. Noteikumu pieņemšana">
          <p>
            Reģistrējoties vai izmantojot Agromarket (agromarket.lv), tu piekrīti šiem lietošanas
            noteikumiem un mūsu Privātuma politikai. Ja tiem nepiekrīti, lūdzu, neizmanto vietni.
          </p>
        </LegalSection>

        <LegalSection title="2. Kas ir Agromarket">
          <p>
            Agromarket ir tiešsaistes katalogs un sludinājumu platforma, kas savieno lauksaimniecības
            uzņēmumus Latvijā un ārvalstīs. Mēs nodrošinām rīku uzņēmuma profila un sludinājumu
            izveidei, kā arī saziņai starp lietotājiem — mēs paši neesam nevienas darījuma puse.
          </p>
        </LegalSection>

        <LegalSection title="3. Konta reģistrācija">
          <p>
            Reģistrējoties tu apliecini, ka sniegtā informācija ir patiesa un precīza, un ka tev ir
            tiesības rīkoties tā uzņēmuma vārdā, kura profilu izveido. Katram uzņēmumam drīkst būt
            tikai viens profils — mēs paturam tiesības noņemt dublējošos vai maldinošus profilus.
            Esi atbildīgs par sava konta piekļuves datu drošību.
          </p>
        </LegalSection>

        <LegalSection title="4. Sludinājumi un saturs">
          <p>Publicējot sludinājumu vai citu saturu Agromarket, tu apliecini, ka:</p>
          <ul className="list-disc pl-5">
            <li>informācija par preci, pakalpojumu vai dzīvnieku ir patiesa un precīza;</li>
            <li>tev ir tiesības piedāvāt attiecīgo preci vai pakalpojumu;</li>
            <li>saturs nepārkāpj trešo personu tiesības (piemēram, autortiesības uz fotogrāfijām);</li>
            <li>
              saturs nav prettiesisks, maldinošs, krāpniecisks vai citādi neatbilstošs labai
              praksei.
            </li>
          </ul>
          <p>
            Mēs paturam tiesības bez iepriekšēja brīdinājuma noņemt vai apturēt jebkuru saturu vai
            profilu, kas pārkāpj šos noteikumus.
          </p>
        </LegalSection>

        <LegalSection title="5. Darījumi starp lietotājiem">
          <p>
            Agromarket ir saziņas un sludinājumu platforma — mēs neesam pušu starpnieks pirkuma,
            pārdošanas vai jebkāda cita darījuma noslēgšanā un neuzņemamies atbildību par darījumu
            izpildi, preces kvalitāti, samaksu vai piegādi. Ikviens darījums starp lietotājiem
            notiek uz pašu lietotāju atbildību un vienošanos.
          </p>
        </LegalSection>

        <LegalSection title="6. Maksa par pakalpojumiem">
          <p>
            Pašlaik Agromarket pamatfunkcijas ir bez maksas. Nākotnē atsevišķas papildu funkcijas
            var kļūt maksas pakalpojumi — par to lietotāji tiks savlaicīgi informēti pirms izmaiņu
            stāšanās spēkā.
          </p>
        </LegalSection>

        <LegalSection title="7. Konta apturēšana vai dzēšana">
          <p>
            Mēs varam apturēt vai dzēst kontu, profilu vai sludinājumu, kas pārkāpj šos noteikumus,
            likumu vai kaitē citiem lietotājiem. Tu vari jebkurā brīdī pats dzēst savu profilu sava
            konta iestatījumos.
          </p>
        </LegalSection>

        <LegalSection title="8. Atbildības ierobežojums">
          <p>
            Vietne tiek nodrošināta &quot;tāda, kāda tā ir&quot;, bez jebkādām tiešām vai netiešām
            garantijām. Mēs necenšamies un neatbildam par lietotāju publicēto sludinājumu saturu,
            precizitāti vai sekām, kas rodas, izmantojot vietnē iegūto informāciju vai stājoties
            darījumā ar citu lietotāju.
          </p>
        </LegalSection>

        <LegalSection title="9. Piemērojamie tiesību akti">
          <p>Šiem noteikumiem piemērojami Latvijas Republikas tiesību akti.</p>
        </LegalSection>

        <LegalSection title="10. Izmaiņas noteikumos">
          <p>
            Mēs varam laiku pa laikam atjaunināt šos noteikumus. Būtisku izmaiņu gadījumā publicēsim
            atjauninātu versiju šajā lapā. Turpinot izmantot vietni pēc izmaiņām, tu apliecini
            piekrišanu atjauninātajiem noteikumiem.
          </p>
        </LegalSection>

        <LegalSection title="11. Kontakti">
          <p>
            Jautājumu gadījumā raksti mums uz{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#3f6b3f] underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </LegalSection>
      </LegalPage>
    );
  }

  return (
    <LegalPage title="Terms of Service" updated="Last updated: September 2026">
      <LegalSection title="1. Acceptance of these terms">
        <p>
          By registering for or using Agromarket (agromarket.lv), you agree to these Terms of
          Service and our Privacy Policy. If you do not agree, please do not use the site.
        </p>
      </LegalSection>

      <LegalSection title="2. What Agromarket is">
        <p>
          Agromarket is an online directory and listings platform connecting agricultural
          businesses in Latvia and abroad. We provide tools to create a business profile and
          listings, and to communicate with other users — we are not a party to any transaction
          between users.
        </p>
      </LegalSection>

      <LegalSection title="3. Account registration">
        <p>
          By registering, you confirm that the information you provide is true and accurate, and
          that you are authorized to act on behalf of the business whose profile you create. Each
          business may have only one profile — we reserve the right to remove duplicate or
          misleading profiles. You are responsible for keeping your account credentials secure.
        </p>
      </LegalSection>

      <LegalSection title="4. Listings and content">
        <p>By posting a listing or other content on Agromarket, you confirm that:</p>
        <ul className="list-disc pl-5">
          <li>the information about the product, service, or animal is true and accurate;</li>
          <li>you have the right to offer the product or service in question;</li>
          <li>the content does not infringe third-party rights (e.g. copyright in photos);</li>
          <li>the content is not unlawful, misleading, fraudulent, or otherwise abusive.</li>
        </ul>
        <p>
          We reserve the right to remove or suspend any content or profile that violates these
          terms, without prior notice.
        </p>
      </LegalSection>

      <LegalSection title="5. Transactions between users">
        <p>
          Agromarket is a listings and communication platform — we are not an intermediary to any
          purchase, sale, or other transaction, and we take no responsibility for the fulfillment
          of a transaction, product quality, payment, or delivery. Any transaction between users
          happens at their own risk and by their own agreement.
        </p>
      </LegalSection>

      <LegalSection title="6. Fees">
        <p>
          Core Agromarket features are currently free to use. Certain additional features may
          become paid in the future — users will be notified in advance of any such change taking
          effect.
        </p>
      </LegalSection>

      <LegalSection title="7. Suspension or deletion of accounts">
        <p>
          We may suspend or delete an account, profile, or listing that violates these terms, the
          law, or harms other users. You may delete your own profile at any time from your
          account settings.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitation of liability">
        <p>
          The site is provided &quot;as is&quot;, without warranties of any kind. We do not
          verify and are not responsible for the content, accuracy, or consequences of listings
          posted by users, or for outcomes arising from information found on the site or from
          transacting with another user.
        </p>
      </LegalSection>

      <LegalSection title="9. Governing law">
        <p>These terms are governed by the laws of the Republic of Latvia.</p>
      </LegalSection>

      <LegalSection title="10. Changes to these terms">
        <p>
          We may update these terms from time to time. For material changes, we will publish an
          updated version on this page. Continuing to use the site after changes take effect means
          you accept the updated terms.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>
          If you have questions, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#3f6b3f] underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
