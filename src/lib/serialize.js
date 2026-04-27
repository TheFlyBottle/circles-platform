export function serializeDoc(doc) {
  if (!doc) return null;

  const data = typeof doc.toObject === 'function' ? doc.toObject() : doc;

  return {
    ...data,
    _id: data._id?.toString(),
    circleId: data.circleId?.toString?.() ?? data.circleId,
    createdAt: data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt,
  };
}

export function serializeDocs(docs) {
  return docs.map(serializeDoc);
}
