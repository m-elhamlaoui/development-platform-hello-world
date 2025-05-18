import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DataPoint {
  label: string;
  value: number;
}

interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
}

interface LineChartProps {
  data: {
    labels: string[];
    datasets: Dataset[];
  };
}

export function LineChart({ data }: LineChartProps) {
  const formatData = () => {
    return data.labels.map((label, index) => {
      const point: any = { label };
      data.datasets.forEach(dataset => {
        point[dataset.label] = dataset.data[index];
      });
      return point;
    });
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={formatData()}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#2d3a51" />
        <XAxis 
          dataKey="label" 
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8' }}
        />
        <YAxis 
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a2234',
            border: '1px solid #2d3a51',
            borderRadius: '8px',
            color: '#fff'
          }}
        />
        <Legend />
        {data.datasets.map((dataset, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={dataset.label}
            stroke={dataset.borderColor}
            strokeWidth={2}
            dot={{ fill: dataset.borderColor, strokeWidth: 2 }}
            activeDot={{ r: 8, fill: dataset.borderColor }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
} 