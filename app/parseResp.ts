const parseResp = (data: Buffer) => {
  const parsedData = data.toString();
  console.log(parsedData);

  const input = [];

  if (parsedData.startsWith("*")) {
    const length = parsedData[1];
    parsedData.split(`/\$\d+/`);
    console.log(parsedData.split(/\$\d+\r\n/));
  }
};

export { parseResp };
