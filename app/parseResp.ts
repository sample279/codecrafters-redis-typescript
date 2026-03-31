const parseResp = (data: Buffer) => {
  const parsedData = data.toString();
  console.log(parsedData);

  console.log(parsedData.split(""));
  const input = [];

  if (parsedData.startsWith("*")) {
    const length = parsedData[1];
    parsedData.split(`/\$\d+/`);
    console.log(parsedData.split(/\$\d+\r\n/));
  }
};

export { parseResp };
