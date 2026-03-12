import { Card } from "@/components/ui/Card";

const pillars = [
  {
    title: "Dataset-Aware Inputs",
    description:
      "Capture process parameters, probe geometry, and material context in structured forms."
  },
  {
    title: "Interactive Outputs",
    description:
      "Preview predicted fields and confidence surfaces using responsive visual panels."
  },
  {
    title: "API-Ready Pipeline",
    description:
      "Route requests through a dedicated prediction module for future model-serving backends."
  }
];

export function ValuePillars() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {pillars.map((pillar) => (
        <Card key={pillar.title}>
          <h2 className="text-lg font-medium">{pillar.title}</h2>
          <p className="mt-3 text-sm text-slate-400">{pillar.description}</p>
        </Card>
      ))}
    </section>
  );
}
