import { api } from "@/lib/api";

export async function seedDemoData(
  _apiKey: string,
  onStep?: (step: string) => void
): Promise<void> {
  onStep?.("Creating agents...");

  const [translationAgent, classificationAgent, ragAgent] = await Promise.all([
    api.agents.create({
      name: "Translation Agent",
      description: "Handles multilingual document translation across 50+ languages",
    }),
    api.agents.create({
      name: "Classification Agent",
      description: "Classifies assets into semantic content clusters using vision LLMs",
    }),
    api.agents.create({
      name: "RAG Agent",
      description: "Retrieval-augmented generation agent for product knowledge base queries",
    }),
  ]);

  onStep?.("Publishing context...");

  await api.context.publish({
    key: "biktarvy_spanish_translation",
    value: {
      source_language: "en",
      target_language: "es",
      document_type: "product_monograph",
      word_count: 4200,
      confidence_score: 0.97,
      status: "completed",
    },
    context_type: "translation_output",
    producer_id: translationAgent.id,
  });

  await api.context.publish({
    key: "asset_cluster_mapping",
    value: {
      asset_type: "banner",
      detected_clusters: ["efficacy", "safety", "dosing"],
      primary_cluster: "efficacy",
      confidence: 0.91,
      market: "US",
    },
    context_type: "classification_output",
    producer_id: classificationAgent.id,
  });

  await api.context.publish({
    key: "product_query_response",
    value: {
      query: "What are the storage requirements for this product?",
      answer: "Store at room temperature between 20-25°C",
      sources: ["product_pi_2024", "who_guidelines"],
      confidence: 0.94,
    },
    context_type: "rag_output",
    producer_id: ragAgent.id,
  });

  onStep?.("Setting up subscriptions...");

  await api.subscriptions.create({
    agent_id: ragAgent.id,
    context_type: "translation_output",
    producer_id: translationAgent.id,
  });

  await api.subscriptions.create({
    agent_id: classificationAgent.id,
    context_type: "rag_output",
    producer_id: ragAgent.id,
  });
}

export async function getOrCreateApiKey(): Promise<string> {
  const cached = localStorage.getItem("substrate_api_key");
  if (cached) return cached;

  const created = await api.apiKeys.create({ name: "Demo Key" });
  localStorage.setItem("substrate_api_key", created.raw_key);
  return created.raw_key;
}

export async function resetAndReseed(
  _apiKey: string,
  onStep?: (step: string) => void
): Promise<void> {
  onStep?.("Resetting system...");
  const agents = await api.agents.list();
  await Promise.allSettled(agents.map((a) => api.agents.delete(a.id)));
  await seedDemoData("", onStep);
}
