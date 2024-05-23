# React-Searchpane
A searchpane component for datatable that uses Ant Design as UI Framework.

It work by using a raw and display dataset for the datatable. When a selection is made on the searchpane it will automacially be reflected via the display dataset. Hence, to use this searchpane, you need to link the datatable source to the display dataset.


Below is an example of how to initial the searchpane.

const [rawData, setRawData] = useState([]);
const [displayRowData, setDisplayRowData] = useState(rawData);


<SearchPane
 constantRowData={rawData}
 setDisplayRowData={setDisplayRowData}
 columnNameList={[columnName1, columnName2]}
></SearchPane>
