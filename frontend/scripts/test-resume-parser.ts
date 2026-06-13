// Quick smoke checks for the resume parser/dateNormalize fixes.
// Run via:  cd /app/frontend && yarn tsx scripts/test-resume-parser.ts
import { normalizeDate, normalizeDateRange, isPresentDate } from "../src/lib/career-tools/resume/dateNormalize";
import { mapSectionsToResumeData } from "../src/lib/career-tools/resume/import/fieldMapper";
import { fixCommonTypos } from "../src/lib/career-tools/resume/improve";

let pass = 0, fail = 0;
function eq<T>(label: string, got: T, want: T) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; console.log("  ✓", label); }
  else    { fail++; console.log("  ✗", label, "\n      got: ", got, "\n      want:", want); }
}

console.log("\n[normalizeDate]");
eq("Sept 2014 → Sep 2014", normalizeDate("Sept 2014"), "Sep 2014");
eq("Sept2014 → Sep 2014", normalizeDate("Sept2014"), "Sep 2014");
eq("Feb2010 → Feb 2010", normalizeDate("Feb2010"), "Feb 2010");
eq("till date → Present", normalizeDate("till date"), "Present");
eq("Till Date → Present", normalizeDate("Till Date"), "Present");
eq("since Sept 2014 → Sep 2014", normalizeDate("since Sept 2014"), "Sep 2014");
eq("09/2014 → Sep 2014", normalizeDate("09/2014"), "Sep 2014");
eq("9-2014 → Sep 2014", normalizeDate("9-2014"), "Sep 2014");
eq("2014 stays 2014", normalizeDate("2014"), "2014");
eq("empty stays empty", normalizeDate(""), "");
eq("isPresentDate(till now)", isPresentDate("till now"), true);
eq("isPresentDate(Jan 2020)", isPresentDate("Jan 2020"), false);
eq("range Sept2014..till date", normalizeDateRange("Sept2014", "till date"), "Sep 2014 – Present");

console.log("\n[fixCommonTypos]");
eq("Leaded → Led", fixCommonTypos("Leaded team of 5"), "Led team of 5");
eq("leaded → led", fixCommonTypos("leaded team"), "led team");
eq("continues improvement → continuous", fixCommonTypos("Drove continues improvement workshops"), "Drove continuous improvement workshops");
eq("till date → Present", fixCommonTypos("Worked till date as PM"), "Worked Present as PM");
eq("Feb2010 → Feb 2010", fixCommonTypos("Started Feb2010"), "Started Feb 2010");
eq("Leaves clean text alone", fixCommonTypos("Managed multiple projects"), "Managed multiple projects");

console.log("\n[mapSectionsToResumeData - dedupe]");
const sections = [
  {
    heading: "Work Experience",
    startIndex: 0,
    content:
      "Working as Project Manager in Echidna Software Pvt Ltd Bangalore since Sept 2014 to till date\n" +
      "Project Manager / Business Analyst in Connex Info Systems since Aug 2012 to Aug 2014\n" +
      "Business Analyst in Databot Systems Pvt Ltd since Jan 2010 to Jul 2012\n",
  },
  {
    heading: "Experience",
    startIndex: 4,
    content:
      "Echidna Software Pvt Ltd, Sept 2014 – Till date\n" +
      "Built customer-facing dashboards.\n" +
      "Reduced ticket backlog by 40%.\n\n" +
      "Connex Info Systems, Aug 2012 – Aug 2014\n" +
      "Led migration to AWS.\n\n" +
      "Databot Systems Pvt Ltd, Jan 2010 – Jul 2012\n" +
      "Documented requirements for 12 enterprise clients.\n",
  },
];
const result = mapSectionsToResumeData(sections, sections.map(s => `${s.heading}\n${s.content}`).join("\n\n"));
eq("3 unique experience entries (deduplicated, not 6)", result.experience.length, 3);
eq("Echidna title cleaned", result.experience[0]?.title, "Project Manager");
eq("Echidna company correct", (result.experience[0]?.company || "").includes("Echidna"), true);
eq("Echidna endDate normalized to Present", result.experience[0]?.endDate, "Present");
eq("Echidna marked current", result.experience[0]?.current, true);
eq("Connex startDate normalized", result.experience[1]?.startDate, "Aug 2012");
eq("Echidna description merged from Project Details section",
  (result.experience[0]?.description || "").includes("dashboards"),
  true);

console.log(`\nResults: ${pass} passed, ${fail} failed\n`);
process.exit(fail > 0 ? 1 : 0);
