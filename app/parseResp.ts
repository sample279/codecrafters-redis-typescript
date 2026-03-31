const parseResp = (data: Buffer) => {
  const parsedData = data.toString();

  if (parsedData.startsWith("*")) {
    const length = parsedData[1];
  }
};

export { parseResp };
