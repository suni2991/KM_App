import React from 'react';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import Calender from './Calender';
import Registration from './Registration';
import AddBootcamp from './AddBootcamp';

function RegistrationTabs() {


  return (
    <div className="table-container">
      <Tabs>
        <TabList style={{color: '#00B4D2'}}>
          <Tab>Registration</Tab>
          <Tab>Trainings</Tab>
          <Tab>Bootcamps</Tab>
        </TabList>

        <TabPanel>
        <Registration />
        </TabPanel>

        <TabPanel>
          <Calender />
        </TabPanel>
        <TabPanel>
          <AddBootcamp />
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default RegistrationTabs;
