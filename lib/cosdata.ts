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

  console.log("Cosdata Token URL:", `${COSDATA_HOST}/auth/create-session`);

  const data = await res.json();

  console.log("COSDATA TOKEN - ", data);

  if (!data.access_token) throw new Error("Failed to authenticate Cosdata");

  cachedToken = data.access_token;
  return cachedToken;
}

async function cosFetch(url: string, options: any = {}) {
  const token = await getToken();

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 401) {
    cachedToken = null; // refresh
    return cosFetch(url, options);
  }

  return res.json();
}

export async function ensureCollectionExists(
  collectionName: string,
  dim: number
) {
  const list = await cosFetch(`${COSDATA_HOST}/vectordb/collections`);

  console.log("Existing collections:", list);

  if (list.collections.some((c: any) => c.name === collectionName)) return;

  await cosFetch(`${COSDATA_HOST}/vectordb/collections`, {
    method: "POST",
    body: JSON.stringify({
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
    }),
  });
}

export async function insertVector(
  collectionName: string,
  id: string,
  vector: number[]
) {
  const txn = await cosFetch(
    `${COSDATA_HOST}/vectordb/collections/${collectionName}/transactions`,
    { method: "POST" }
  );

  console.log(
    `Inserting vector for ID: ${id} into collection: ${collectionName}`
  );

  console.log("txn = ", txn);

  await cosFetch(
    `${COSDATA_HOST}/vectordb/collections/${collectionName}/transactions/${txn.transaction_id}/vectors`,
    {
      method: "POST",
      body: JSON.stringify([
        {
          id,
          document_id: id,
          dense_values: vector,
        },
      ]),
    }
  );

  await cosFetch(
    `${COSDATA_HOST}/vectordb/collections/${collectionName}/transactions/${txn.transaction_id}/commit`,
    { method: "POST" }
  );
}

export async function searchVectors(
  collectionName: string,
  vector: number[],
  topK = 10
) {
  const result = await cosFetch(
    `${COSDATA_HOST}/vectordb/collections/${collectionName}/search/dense`,
    {
      method: "POST",
      body: JSON.stringify({
        query_vector: vector,
        top_k: topK,
        return_raw_text: false,
      }),
    }
  );

  return result.results ?? [];
}

export async function vectorExists(collectionName: string, id: string) {
  const vectors = await cosFetch(
    `${COSDATA_HOST}/vectordb/collections/${collectionName}/vectors?document_id=${id}`
  );
  return Array.isArray(vectors) && vectors.length > 0;
}
