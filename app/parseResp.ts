const parseResp = (data: Buffer) => {
  let parsedData: string = data.toString();
  console.log(parsedData);

  const input = [];

  if (parsedData.startsWith("*")) {
    let parsedDataArray: string[] = parsedData.split(/\$\d+\r\n/);
    parsedDataArray = parsedData.split(/\r\n/);
    console.log(parsedDataArray);
  }
};

export { parseResp };
