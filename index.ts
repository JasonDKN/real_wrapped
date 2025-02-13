import { data as spotifyData } from "./data/Streaming_History_Audio_2024_14_truncated";

const aggregateBy = (property: string, data: Record<string, unknown>[]) => {
  const aggregatedData: Record<string, number> = {};

  for (const item of data) {
    const aggregateField = item[property];

    if (typeof aggregateField !== "string") {
      throw new Error("Invalid property!");
    }

    if (typeof item.ms_played !== "number") {
      throw new Error("Please give me ms_played!");
    }

    const currentPlaytime = aggregatedData[aggregateField];
    if (currentPlaytime === undefined) {
      aggregatedData[aggregateField] = item.ms_played;
    } else {
      aggregatedData[aggregateField] += item.ms_played;
    }
  }

  return aggregatedData;
};

const sortEntriesByValue = (entries: [string, number][]) => {
  return entries.sort(([, aValue], [, bValue]) => bValue - aValue);
};

const formatEntries = (entries: [string, number][]) => {
  return entries.map((item, index) => {
    return `${index + 1}. ${item[0]}: ${Math.round(
      item[1] / 1000 / 60
    )} minutes`;
  });
};

const generateTopTenBy = (field: string) => {
  return formatEntries(
    sortEntriesByValue(Object.entries(aggregateBy(field, spotifyData)))
  );
};

const parseArgs = (): { listSize: number; topTenType: string } => {
  const passedInArgs = process.argv.slice(2);
  const knownArgs = ["type", "listSize"];

  for (const arg of passedInArgs) {
    if (!arg.startsWith("--")) {
      throw new Error(
        "Invalid argument format. Use -- at beginning of argument."
      );
    }
    const argName = arg.replace("--", "").split("=")[0];
    if (!knownArgs.includes(argName)) {
      throw new Error(`Invalid argument: ${argName}.`);
    }
  }

  const listSize = Number(
    passedInArgs.find((arg) => arg.includes("listSize"))?.split("=")[1]
  );

  if (Number.isNaN(listSize)) {
    throw new Error("Please provide a numeric value for list size.");
  }

  const topTenType = passedInArgs
    .find((arg) => arg.includes("type"))
    ?.split("=")[1];

  if (
    topTenType !== "songs" &&
    topTenType !== "albums" &&
    topTenType !== "artists"
  ) {
    throw new Error(`Argument: ${topTenType} does not exist.`);
  }

  if (typeof topTenType === "undefined") {
    throw new Error("Nice try, buddy!");
  }
  if (typeof listSize === "undefined") {
    throw new Error("Nice try, buddy!");
  }

  return {
    listSize: Number(listSize),
    topTenType,
  };
};

const handleArg = (topTenType: string, listSize: number) => {
  const argumentFieldMapping: Record<string, string> = {
    artists: "master_metadata_album_artist_name",
    songs: "master_metadata_track_name",
    albums: "master_metadata_album_album_name",
  };
  console.log(
    generateTopTenBy(argumentFieldMapping[topTenType]).slice(0, listSize)
  );
};

const { listSize, topTenType } = parseArgs();
handleArg(topTenType, listSize);
