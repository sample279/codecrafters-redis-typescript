const parseResp = (data: Buffer) => {
  const parsedData: string = data.toString();

  const lines: string[] = parsedData
    .split("\r\n")
    .filter((line: string) => line.length > 0);

  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("$")) {
      const value = lines[i + 1];
      result.push(value);
      i++;
    }
  }

  return result;
};

export { parseResp };
