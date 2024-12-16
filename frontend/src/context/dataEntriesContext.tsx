import {
  Accessor,
  createContext,
  createSignal,
  JSX,
  Setter,
  useContext,
} from "solid-js";

interface DataEntry {
  key: string;
  value: number;
}

const DataEntryContext = createContext<{
  dataEntries: Accessor<DataEntry[]>;
  setDataEntries: Setter<DataEntry[]>;
}>();

export const DataEntryProvider = (props: { children: JSX.Element }) => {
  const [dataEntries, setDataEntries] = createSignal<DataEntry[]>([]);
  return (
    <DataEntryContext.Provider value={{ dataEntries, setDataEntries }}>
      {props.children}
    </DataEntryContext.Provider>
  );
};

export const useDataEntry = () => {
  const context = useContext(DataEntryContext);
  if (!context) {
    throw new Error("No data entry context");
  }
  return context;
};
