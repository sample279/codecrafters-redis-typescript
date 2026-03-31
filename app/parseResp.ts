const parseResp = (data: Buffer) => {
  let parsedData: string = data.toString();
  console.log(parsedData);

  const input = [];

  if (parsedData.startsWith("*")) {
    const parsedDataArray = parsedData.split(/\$\d+\r\n/);
    console.log(parsedDataArray);
  }
};

export { parseResp };
