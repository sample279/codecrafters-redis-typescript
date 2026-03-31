const parseResp = (data: Buffer) => {
  let parsedData: string = data.toString();
  console.log(parsedData);

  const input = [];

  if (parsedData.startsWith("*")) {
    let parsedDataArray: string[] = parsedData.trim().split(/[\*\$]?\d+\r\n/);
    console.log(parsedDataArray);

    parsedDataArray = parsedDataArray.join("").split(/\r\n/);
    console.log(parsedDataArray);
  }
};

export { parseResp };
