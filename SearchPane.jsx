import { useState, useEffect } from "react";
import {
  Skeleton,
  Flex,
  Row,
  Col,
  List,
  Input,
  Checkbox,
  Badge,
  message,
} from "antd";

import { SearchOutlined } from "@ant-design/icons";

export default function SearchPane({
  constantRowData,
  setDisplayRowData,
  columnNameList,
  hideWhenNull = false,
}) {
  //currentRowData is basically displayRowData but currentRowData local to only this component
  const [currentRowData, setCurrentRowData] = useState(constantRowData);
  //loading of searchpane
  const [loading, setLoading] = useState(true);
  //edit the column span of the searchpane so it can adjust the column searchpane
  //width according to the number of filter column the user inputted
  const [colSpan, setColSpan] = useState(24);
  //the list of items in every column searchpane
  const [listItemObj, setListItemObj] = useState({});
  //know which column searchpane is last touched and enable the last touch column to
  //let the last toucheed column searchpane list to not refresh
  const [lastTouchColumnName, setLastTouchColumnName] = useState("");
  const [checkBoxObj, setCheckBoxObj] = useState({});
  const [filterSetting, setFilterSetting] = useState({});

  const [liveColumnNameList, setLiveColumnNameList] = useState(columnNameList);

  const uniqueID = Math.random();

  const handleCheck = (columnName, value, checked) => {
    let tempObj = checkBoxObj;

    if (checked) {
      //add to list
      if (tempObj[columnName] === undefined) {
        tempObj[columnName] = [String(value)];
      } else {
        tempObj[columnName] = [...tempObj[columnName], String(value)];
      }
    } else {
      //remove from list
      tempObj[columnName] = tempObj[columnName].filter(
        (item) => item !== value
      );
    }

    setCheckBoxObj(tempObj);
    handleFilter(columnName, tempObj[columnName]);
  };

  const handleFilter = (columnName, value) => {
    let tempObj = filterSetting;
    if (value.length > 0) {
      tempObj[columnName] = [value];
    } else {
      tempObj[columnName] = [];
    }
    let displayData = constantRowData;

    Object.keys(tempObj).map((key) => {
      tempObj[key].map((filterArray) => {
        if (filterArray.length > 0) {
          displayData = displayData.filter((row) => {
            return filterArray.includes(String(row[key]));
          });
        }
      });
    });

    setLastTouchColumnName(columnName);
    setFilterSetting(tempObj);
    setDisplayRowData(displayData);
    setCurrentRowData(displayData);

    //Despite there's data to invoke this function, the filter have conflict and resulted in no data
    //Hence, I reset the whole filtering of the searchpane back to original to prevent confusion
    if (displayData.length == 0) {
      resetSearchPane();
    }
  };

  const resetSearchPane = () => {
    setCheckBoxObj({});
    setLastTouchColumnName("");
    setFilterSetting({});
    setDisplayRowData(constantRowData);
    setCurrentRowData(constantRowData);
  };

  useEffect(() => {
    //Will reset the searchpane whenever the main data change
    resetSearchPane();
  }, [constantRowData]);

  useEffect(() => {
    let len = liveColumnNameList.length;
    var tempColumnNameList = liveColumnNameList;
    if (len < 5) {
      // if 4 column or less than it will match the be equally assign to fill the max width
      setColSpan(24 / len);
    } else {
      // else it will auto fit 25% of the width for each column
      setColSpan(6);
    }
    if (currentRowData && currentRowData.length > 0) {
      const columnObj = {};
      currentRowData.map((item) => {
        tempColumnNameList.map((columnName) => {
          if (
            columnName === lastTouchColumnName &&
            filterSetting[columnName].length > 0
          ) {
            columnObj[columnName] = listItemObj[columnName];
          } else {
            if (columnObj[columnName] === undefined) {
              columnObj[columnName] = {};
            }

            if (item[columnName] !== undefined) {
              let value = item[columnName].toString();
              if (value === "") {
                value = "";
              }
              if (columnObj[columnName][value] === undefined) {
                columnObj[columnName][value] = 1;
              } else {
                columnObj[columnName][value] = columnObj[columnName][value] + 1;
              }
            } else {
              // message.error(
              //   "Column Name " +
              //     columnName +
              //     " cannot be found in the data provided"
              // );

              tempColumnNameList = tempColumnNameList.filter(
                (item) => item !== columnName
              );
              setLiveColumnNameList(tempColumnNameList);
            }
          }
        });
      });

      //sorting
      tempColumnNameList.map((columnName) => {
        if (
          columnName === lastTouchColumnName &&
          filterSetting[columnName].length > 0
        ) {
        } else {
          let tempList = [];
          tempList = Object.entries(columnObj[columnName]);
          tempList = tempList.sort((a, b) => {
            // equal items sort equally
            if (a === b) {
              return 0;
            }

            // nulls sort after anything else
            if (a === null || a === "") {
              return 1;
            }
            if (b === null || b === "") {
              return -1;
            }

            // ascending
            // return a < b ? -1 : 1;

            // descending
            return a < b ? 1 : -1;
          });
          columnObj[columnName] = tempList;
        }
      });

      setListItemObj(columnObj);
    } else {
      setListItemObj({});
    }
    setLoading(false);
  }, [currentRowData, columnNameList, liveColumnNameList]);

  return (
    <>
      <div
        style={{
          display:
            !hideWhenNull || currentRowData.length > 0 ? "block" : "none",
        }}
      >
        <Row gutter={24}>
          {liveColumnNameList.map((columnName) => {
            /*make it look more human?*/
            var tempColumnName = columnName.toLowerCase();
            var tempColumnNameList = tempColumnName.split("_");
            var newColumnNameList = [];
            tempColumnNameList.map((word) => {
              newColumnNameList.push(
                word.charAt(0).toUpperCase() + word.slice(1)
              );
            });

            return (
              <Col key={columnName + uniqueID} span={colSpan}>
                <Input
                  id={columnName + "input" + uniqueID}
                  size="small"
                  value={newColumnNameList.join(" ")}
                  addonAfter={<SearchOutlined />}
                />

                <div
                  style={{
                    // height: 220,
                    marginBottom: 10,
                  }}
                  id={columnName + "div" + uniqueID}
                >
                  <Skeleton loading={loading} active>
                    <List
                      size="small"
                      bordered
                      style={{
                        marginTop: 10,
                        height: 200,
                        overflow: "auto",
                      }}
                      dataSource={
                        listItemObj[columnName] !== undefined
                          ? listItemObj[columnName] //Object.keys(listItemObj[columnName]).map((item) => item)
                          : []
                      }
                      renderItem={(item) => (
                        <List.Item>
                          <Checkbox
                            checked={
                              checkBoxObj[columnName] === undefined
                                ? false
                                : checkBoxObj[columnName].includes(
                                    String(item[0])
                                  )
                            }
                            onChange={(e) => {
                              handleCheck(
                                columnName,
                                item[0],
                                e.target.checked
                              );
                            }}
                          >
                            <Flex
                              gap="small"
                              style={{
                                overflow: "hidden",
                                width: "100%",
                                height: 25,
                              }}
                            >
                              <Badge count={item[1]} color="#cfcfcf" />
                              <p
                                style={{
                                  display: "inline-block",
                                  whiteSpace: "nowrap",
                                  height: 25,
                                }}
                              >
                                {item[0]}
                              </p>
                            </Flex>
                          </Checkbox>
                        </List.Item>
                      )}
                    />
                  </Skeleton>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
    </>
  );
}
