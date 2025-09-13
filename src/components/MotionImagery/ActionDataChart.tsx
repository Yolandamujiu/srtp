import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ActionData {
  time: string;
  leftHand: number;
  rightHand: number;
  leftFoot: number;
  rightFoot: number;
}

interface ActionDataChartProps {
  actionData: ActionData[];
}

const ActionDataChart: React.FC<ActionDataChartProps> = ({ actionData }) => {
  return (
    <div className="bg-blue-900/70 p-4 rounded-lg border border-blue-700 h-64">
      <h2 className="text-xl font-semibold mb-4 text-white">实时动作数据</h2>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={actionData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="time" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#444' }}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ color: '#fff' }}
          />
          <Line type="monotone" dataKey="leftHand" stroke="#00ff00" strokeWidth={2} name="左手" />
          <Line type="monotone" dataKey="rightHand" stroke="#ff0000" strokeWidth={2} name="右手" />
          <Line type="monotone" dataKey="leftFoot" stroke="#0000ff" strokeWidth={2} name="左脚" />
          <Line type="monotone" dataKey="rightFoot" stroke="#ffff00" strokeWidth={2} name="右脚" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActionDataChart;