import commandLineArgs from "command-line-args";
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

const validateOptions = ({
  listSize,
  type,
}: {
  listSize: number;
  type: string;
}) => {
  if (Number.isNaN(listSize)) {
    throw new Error("Please provide a numeric value for list size.");
  }

  if (type !== "songs" && type !== "albums" && type !== "artists") {
    throw new Error(`Argument: ${type} does not exist.`);
  }

  if (typeof type === "undefined") {
    throw new Error("Nice try, buddy!");
  }

  if (typeof listSize === "undefined") {
    throw new Error("Nice try, buddy!");
  }
};

const optionDefinitions = [
  { name: "type", type: String },
  { name: "listSize", type: Number },
];

const options = commandLineArgs(optionDefinitions) as {
  type: string;
  listSize: number;
};

const handleOptions = (options: { listSize: number; type: string }) => {
  const argumentFieldMapping: Record<string, string> = {
    artists: "master_metadata_album_artist_name",
    songs: "master_metadata_track_name",
    albums: "master_metadata_album_album_name",
  };
  console.log(
    generateTopTenBy(argumentFieldMapping[options.type]).slice(
      0,
      options.listSize
    )
  );
};

validateOptions(options);
handleOptions(options);
