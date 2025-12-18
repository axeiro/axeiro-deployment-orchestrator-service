const validateDeploymentPayload = (payload) => {
  const errors = [];

  if (!payload.appType) errors.push("appType missing");
  if (!payload.source?.provider) errors.push("source.provider missing");
  if (!payload.source?.repo) errors.push("source.repo missing");
  if (!payload.runtime) errors.push("runtime missing");
  if (!payload.startCommand) errors.push("startCommand missing");

  if (!["small", "medium", "large"].includes(payload.computeSize)) {
    errors.push("Invalid computeSize");
  }

  if (payload.spendCap <= 0) {
    errors.push("Invalid spendCap");
  }

  

  return errors;
};

export default validateDeploymentPayload