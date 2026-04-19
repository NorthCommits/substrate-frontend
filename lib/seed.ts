import { api } from "@/lib/api";

export async function seedDemoData(
  apiKey: string,
  onStep?: (step: string) => void
): Promise<void> {
  // Step 1 — Register Agents
  onStep?.("Creating agents...");

  const [translationAgent, classificationAgent, ragAgent] = await Promise.all([
    api.agents.create(
      {
        name: "Translation Agent",
        description: "Handles multilingual document translation across 50+ languages",
      },
      apiKey
    ),
    api.agents.create(
      {
        name: "Classification Agent",
        description:
          "Classifies assets into semantic content clusters using vision LLMs",
      },
      apiKey
    ),
    api.agents.create(
      {
        name: "RAG Agent",
        description:
          "Retrieval-augmented generation agent for product knowledge base queries",
      },
      apiKey
    ),
  ]);

  // Step 2 — Publish Context
  onStep?.("Publishing context...");

  await api.context.publish(
    {
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
    },
    apiKey
  );

  await api.context.publish(
    {
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
    },
    apiKey
  );

  await api.context.publish(
    {
      key: "product_query_response",
      value: {
        query: "What are the storage requirements for this product?",
        answer: "Store at room temperature between 20-25°C",
        sources: ["product_pi_2024", "who_guidelines"],
        confidence: 0.94,
      },
      context_type: "rag_output",
      producer_id: ragAgent.id,
    },
    apiKey
  );

  // Step 3 — Create Subscriptions
  onStep?.("Setting up subscriptions...");

  await api.subscriptions.create(
    {
      agent_id: ragAgent.id,
      context_type: "translation_output",
      producer_id: translationAgent.id,
    },
    apiKey
  );

  await api.subscriptions.create(
    {
      agent_id: classificationAgent.id,
      context_type: "rag_output",
      producer_id: ragAgent.id,
    },
    apiKey
  );
}

/**
 * Gets or creates an API key for the current user (JWT in localStorage).
 * Returns the raw key string. Throws if token is missing.
 */
export async function getOrCreateApiKey(): Promise<string> {
  const token = localStorage.getItem("substrate_token");
  if (!token) throw new Error("Not authenticated");

  // Check for a cached key first
  const cached = localStorage.getItem("substrate_active_api_key");
  if (cached) return cached;

  // Try listing existing keys
  const keys = await api.apiKeys.list(token).catch(() => [] as Awaited<ReturnType<typeof api.apiKeys.list>>);

  if (keys.length > 0) {
    // We can't get the raw key from the list — must create a new one if no raw key is cached
    // Fall through to create
  }

  // Create a new demo key
  const created = await api.apiKeys.create(token, { name: "Demo Key" });
  localStorage.setItem("substrate_active_api_key", created.key);
  return created.key;
}

export async function resetAndReseed(
  apiKey: string,
  onStep?: (step: string) => void
): Promise<void> {
  onStep?.("Resetting system...");
  const agents = await api.agents.list(apiKey);
  await Promise.allSettled(agents.map((a) => api.agents.delete(a.id, apiKey)));
  await seedDemoData(apiKey, onStep);
}
