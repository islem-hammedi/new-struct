import React from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import ChartOne from '../components/Charts/ChartOne';
import ChartThree from '../components/Charts/ChartThree';
import ChartTwo from '../components/Charts/ChartTwo';

const Chart: React.FC = () => {
  return (
    <>
      <Breadcrumb pageName="Chart" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
       
        
        <div className="col-span-1">
          <ChartTwo />
        </div>
        <div className="col-span-1">
          <ChartThree />
        </div>
         <div className="col-span-1 md:col-span-2">
          <ChartOne />
        </div>
      </div>
    </>
  );
};

export default Chart;