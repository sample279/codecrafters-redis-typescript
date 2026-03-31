const parseResp = (data: Buffer) => {
  const parsedData: string = data.toString();

  const lines: string[] = parsedData
    .split("\r\n")
    .filter((line: string) => line.length > 0);

  console.log(lines);
};

export { parseResp };
