/* eslint-disable @typescript-eslint/no-explicit-any */

const COSDATA_HOST = process.env.COSDATA_HOST!;
const COSDATA_USERNAME = process.env.COSDATA_USERNAME!;
const COSDATA_PASSWORD = process.env.COSDATA_PASSWORD!;

let cachedToken: string | null = null;

async function getToken() {
  if (cachedToken) return cachedToken;

  const res = await fetch(`${COSDATA_HOST}/auth/create-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: COSDATA_USERNAME,
      password: COSDATA_PASSWORD,
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to authenticate Cosdata");

  cachedToken = data.access_token;
  console.log("cached token - ", cachedToken);
  return cachedToken;
}

async function cosFetch(url: string, options: any = {}) {
  const token = await getToken();

  console.log(`cosFetch: ${url}`);

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // Read body once as text
  const rawBody = await res.text();
  let resData: any;

  try {
    resData = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    resData = rawBody ? { raw: rawBody } : {};
  }

  console.log(`cosFetch response status: ${res.status}`, resData);

  if (res.status === 401) {
    cachedToken = null; // refresh
    return cosFetch(url, options);
  }

  if (!res.ok) {
    throw new Error(
      `CosFetch error: ${res.status} ${res.statusText} - ${JSON.stringify(resData)}`
    );
  }

  return resData;
}

export async function insertVector(
  collectionName: string,
  id: string,
  vector: number[]
) {
  let txn: any = null;

  try {
    // Step 1: Create transaction
    txn = await cosFetch(
      `${COSDATA_HOST}/vectordb/collections/${collectionName}/transactions`,
      { method: "POST" }
    );

    console.log("Transaction created:", txn);

    if (!txn.transaction_id) {
      throw new Error(`Failed to create transaction: ${JSON.stringify(txn)}`);
    }

    console.log("Transaction created:", txn);

    // Step 2: Add vector
    const payload = {
      id,
      document_id: id,
      dense_values: vector,
    };

    await cosFetch(
      `${COSDATA_HOST}/vectordb/collections/${collectionName}/transactions/${txn.transaction_id}/vectors`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    // Step 3: Commit transaction
    await cosFetch(
      `${COSDATA_HOST}/vectordb/collections/${collectionName}/transactions/${txn.transaction_id}/commit`,
      { method: "POST" }
    );

    console.log("Transaction committed successfully");
  } catch (error) {
    console.error("Error during insertVectorSafe:", error);
    throw error; // rethrow so caller knows it failed
  } finally {

    console.log("Insert vector cleanup");
    console.log("Transaction info:", txn);
    // If transaction was opened, abort it
    if (txn?.transaction_id) {
      try {
        await cosFetch(
          `${COSDATA_HOST}/vectordb/collections/${collectionName}/transactions/${txn.transaction_id}/abort`,
          { method: "POST" }
        );
        console.log("Transaction aborted due to error");
      } catch (abortError) {
        console.error("Failed to abort transaction:", abortError);
      }
    }

  }
}

export async function ensureCollectionExists(
  collectionName: string,
  dim: number
) {
  try {
    const list = await cosFetch(`${COSDATA_HOST}/vectordb/collections`);

    console.log("Existing collections response:", list);

    if (!list) {
      console.warn("Unexpected response format: 'collections' is missing or not an array.");
      throw new Error("Failed to fetch collections or invalid response format.");
    }

    const exists = list.some((c: any) => c.name === collectionName);
    if (exists) return;

    const createPayload = {
      name: collectionName,
      description: "Lost & Found item embeddings",
      dense_vector: {
        enabled: true,
        dimension: dim,
      },
      sparse_vector: { enabled: false },
      tf_idf_options: { enabled: false },
      config: {},
      store_raw_text: false,
    };

    console.log('create payload - ', createPayload);

    const createRes = await cosFetch(`${COSDATA_HOST}/vectordb/collections`, {
      method: "POST",
      body: JSON.stringify(createPayload),
    });

    console.log("Collection creation response:", createRes);
  } catch (error) {
    console.error("Error in ensureCollectionExists:", error);
    throw error; // rethrow if you want upstream to handle it
  }
}

export async function ensureDenseIndexExists(collectionName: string) {
  // 1) Check existing indexes
  const indexes = await cosFetch(
    `${COSDATA_HOST}/vectordb/collections/${collectionName}/indexes`,
    { method: "GET" }
  );

  const hasDense = !!indexes?.dense?.index?.type || !!indexes?.dense?.name;
  if (hasDense) return;

  // 2) Create dense index (HNSW, cosine, auto quantization)
  const payload = {
    name: `${collectionName}_dense_hnsw`,
    distance_metric_type: "cosine",
    quantization: {
      type: "auto",
      properties: {
        sample_threshold: 100
      }
    },
    index: {
      type: "hnsw",
      properties: {
        // Sensible defaults; tune as needed
        num_layers: 7,
        max_cache_size: 1000,
        ef_construction: 512,
        ef_search: 256,
        neighbors_count: 32,
        level_0_neighbors_count: 64
      }
    }
  };

  const res = await cosFetch(
    `${COSDATA_HOST}/vectordb/collections/${collectionName}/indexes/dense`,
    { method: "POST", body: JSON.stringify(payload) }
  );

  // Dense index creation returns {} on 201 Created
  console.log("Dense index created:", res);
}

export async function searchVectors(
  collectionName: string,
  vector: number[],
  topK = 10
) {
  const payload = {
    query_vector: vector,
    top_k: topK,
    return_raw_text: false,
  }

  console.log("searchVectors payload - ", payload);

  const result = await cosFetch(
    `${COSDATA_HOST}/vectordb/collections/${collectionName}/search/dense`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  console.log("searchVectors result - ", result);

  return result.results ?? [];
}

export async function vectorExists(collectionName: string, id: string) {
  const vectors = await cosFetch(
    `${COSDATA_HOST}/vectordb/collections/${collectionName}/vectors?document_id=${id}`
  );
  return Array.isArray(vectors) && vectors.length > 0;
}
