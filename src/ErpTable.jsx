import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
} from '@mui/material';

import axios from 'axios';

import SideNav from './SideNav';
import { useMediaQuery } from 'react-responsive';
import { FaBars } from 'react-icons/fa';
import { SvgIcon } from '@mui/material';
import Loading from './Loading';

function ErpTable() {
  const [openNav, setOpenNav] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedValues, setSelectedValues] = useState({});
  const [data, setErpData] = useState([]);
  const [timeRanges, setTimeRanges] = useState([]);
  const [uniqueZoneIDs, setUniqueZoneIDs] = useState([]);

  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 1224px)'
  });

  useEffect(() => {
    setIsLoading(true);
    fetchTimeRanges();
    fetchErpRates();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      // Extract unique ZoneIDs from the data
      const zoneIDs = [...new Set(data.map(row => row.ZoneID))];
      setUniqueZoneIDs(zoneIDs);
  
      // Initialize default selected values
      const defaultSelectedValues = {};
    
      // Iterate through uniqueZoneIDs and set default values for each row
      zoneIDs.forEach(zoneID => {
        const row = data.find(row => row.ZoneID === zoneID);
        if (row) {
          const rowId = row._id;
          defaultSelectedValues[rowId] = {
            VehicleType: row.defaultVehicleType || VehicleTypes[0],
            dayType: row.defaultDayType || dayTypes[0],
            TimeRange: row.defaultStartTime || timeRanges[0],
          };
        }
      });
    
      setSelectedValues(defaultSelectedValues);
    }
  }, [data, timeRanges]);

  

  function fetchErpRates() {
    axios.get('https://traffooze-flask.onrender.com/erp')
      .then(response => {
      
        setErpData(response.data);
        setIsLoading(false);

      })
      .catch(error => {
        console.error(error);
      });
  }

  function fetchTimeRanges() {
    axios.get('https://traffooze-flask.onrender.com/erp_time')
      .then(response => {

        setTimeRanges(response.data);

      })
      .catch(error => {
        console.error(error);
      });
  }

  const handleChange = (rowId, field, value) => {
    setSelectedValues((prevSelectedValues) => ({
      ...prevSelectedValues,
      [rowId]: {
        ...prevSelectedValues[rowId],
        [field]: value,
      },
    }));
  };
  
  useEffect(() => {
    console.log(selectedValues);
  }, [selectedValues]);

  const dayTypes = ["Weekdays", "weekend"];

  const VehicleTypes = [
    'Heavy Goods Vehicles/Small Buses', 
    'Passenger Cars/Light Goods Vehicles/Taxis', 
    'Light Goods Vehicles', 
    'Very Heavy Goods Vehicles/Big Buses', 
    'Taxis', 
    'Motorcycles'
    ]


  return (
    <div className="app-container">
    <div style={{ display: 'flex' }}>
      {!isDesktopOrLaptop && (
                    <button
                      style={{
                        display: 'block', // Display only on small screens
                        padding: '10px',
                        position: 'fixed',
                        zIndex: 9999,
                        top: 10,
                        left: 10,
                        height: 46,
                        backgroundColor: '#6A5ACD',
                        borderRadius: '5px',
                        borderColor: 'white'
                      }}
                      onClick={() => setOpenNav(!openNav)}
                    >
                      <SvgIcon fontSize='medium'>
                      <FaBars color='white'/>
                      </SvgIcon>
                    </button>
                  )}
      <SideNav onClose={() => setOpenNav(false)} open={openNav}/> 
      <div style={{ flex: '1', paddingLeft: '300px', paddingTop: '50px'}}>
      <Typography variant="h5" gutterBottom>
        ERP Gantry Rates
      </Typography>
    <TableContainer component={Paper} style={{ marginBottom: '20px' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Zone ID</TableCell>
            <TableCell>Vehicle Type</TableCell>
            <TableCell>Day Type</TableCell>
            <TableCell>Time Range</TableCell>
            <TableCell>Charge Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {uniqueZoneIDs.map((zoneID) => {
            // Find the first row with the corresponding ZoneID
            const row = data.find(row => row.ZoneID === zoneID);
            const rowId = row._id;
            const selectedRowValues = selectedValues[rowId] || {};

            const filteredData = data.filter(item =>
                item.ZoneID === zoneID &&
                (selectedRowValues.VehicleType ? item.VehicleType === selectedRowValues.VehicleType : true) &&
                (selectedRowValues.dayType ? item.DayType === selectedRowValues.dayType : true) &&
                (selectedRowValues.TimeRange ? (item.StartTime + " to " + item.EndTime) === selectedRowValues.TimeRange : true)
              );
    
            // Find the corresponding ChargeAmount for the filtered data
            const chargeAmount = filteredData.length > 0 ? ("$" + filteredData[0].ChargeAmount) : 'no available data';

            return (
              <TableRow key={rowId}>
                <TableCell>{zoneID}</TableCell>
                <TableCell>
                    <Autocomplete
                        value={selectedRowValues.VehicleType || VehicleTypes[0]}
                        onChange={(_, newValue) =>
                            handleChange(rowId, 'VehicleType', newValue)
                        }
                        options={VehicleTypes}
                        renderInput={(params) => <TextField {...params} />}
                    />
                </TableCell>
                <TableCell>
                    <Autocomplete
                        value={selectedRowValues.dayType || dayTypes[0]}
                        onChange={(_, newValue) =>
                        handleChange(rowId, 'dayType', newValue)
                        }
                        options={dayTypes}
                        renderInput={(params) => <TextField {...params} />}
                    />
                </TableCell>
                <TableCell>
                  <Autocomplete
                    value={selectedRowValues.TimeRange || timeRanges[0]}
                    onChange={(_, newValue) =>
                      handleChange(rowId, 'TimeRange', newValue)
                    }
                    options={timeRanges}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </TableCell>
                <TableCell>{chargeAmount}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
    <Typography variant="h5" gutterBottom>
                Zone Locations
    </Typography>
    <Table>
      <TableHead>
          <TableRow>
            <TableCell>Zone ID</TableCell>
            <TableCell>Locations</TableCell>
          </TableRow>
      </TableHead>
      <TableBody>
          <TableRow>
              <TableCell>AY1</TableCell>
              <TableCell>
                AYE to City before Alexandra Road
              </TableCell>
          </TableRow>
          <TableRow>
              <TableCell>AYC</TableCell>
              <TableCell>
                Clementi Avenue 6 into AYE (City),<br/>
                Clementi Avenue 6 into AYE (City),<br/>
                AYE to City Before Clementi Avenue 6
              </TableCell>
          </TableRow>
          <TableRow>
              <TableCell>AYT</TableCell>
              <TableCell>
                AYE to Tuas Before Clementi Road
              </TableCell>
          </TableRow>
          <TableRow>
              <TableCell>BKE</TableCell>
              <TableCell>
                Bt Timah Expressway (Sb betw Dairy Farm Rd and PIE)
              </TableCell>
          </TableRow>
          <TableRow>
              <TableCell>BKZ</TableCell>
              <TableCell>
                Upper Boon Keng Road
              </TableCell>
          </TableRow>
          <TableRow>
              <TableCell>BMC</TableCell>
              <TableCell>
                Victoria Street,<br/>
                Nicoll Highway,<br/>
                Bencoolen Street,<br/>
                Queen Street,<br/>
                North Bridge Road,<br/>
                Beach Road,<br/>
                Temasek Boulevard,<br/>
                Republic Boulevard,<br/>
                River Valley Road
              </TableCell>
          </TableRow>
          <TableRow>
              <TableCell>CBD</TableCell>
              <TableCell>
                Eu Tong Sen Street,<br/>
                Lim Teck Kim Road,<br/>
                Anson Road,<br/>
                Tanjong Pagar Road,<br/>
                Havelock Road/Clemenceau Ave,<br/>
                Havelock Road/CTE Exit,<br/>
                Merchant Road/Clemenceau Ave,<br/>
                Merchant Road/CTE Exit,<br/>
                Central Boulevard,<br/>
                Slip Road from Westbound MCE towards Maxwell Road,<br/>
                Sheares Avenue towards Sheares Link
              </TableCell>
          </TableRow>
      </TableBody>
    </Table>
    </div>
    </div>
    {isLoading && <Loading />}
    </div>
  );
}

export default ErpTable;
