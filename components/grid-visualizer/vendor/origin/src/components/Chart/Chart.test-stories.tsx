import * as React from 'react';
import * as Chart from './';

const SAMPLE_DATA = [
  { date: 'Mon', value: 120 },
  { date: 'Tue', value: 150 },
  { date: 'Wed', value: 140 },
  { date: 'Thu', value: 180 },
  { date: 'Fri', value: 160 },
  { date: 'Sat', value: 200 },
  { date: 'Sun', value: 190 },
];

const MULTI_SERIES_DATA = [
  { date: 'Mon', incoming: 120, outgoing: 80 },
  { date: 'Tue', incoming: 150, outgoing: 95 },
  { date: 'Wed', incoming: 140, outgoing: 110 },
  { date: 'Thu', incoming: 180, outgoing: 100 },
  { date: 'Fri', incoming: 160, outgoing: 130 },
  { date: 'Sat', incoming: 200, outgoing: 120 },
  { date: 'Sun', incoming: 190, outgoing: 140 },
];

export function Sparkline() {
  return (
    <Chart.Line
      data={SAMPLE_DATA}
      dataKey="value"
      height={170}
      data-testid="chart"
    />
  );
}

export function SparklineWithColor() {
  return (
    <Chart.Line
      data={SAMPLE_DATA}
      dataKey="value"
      height={170}
      color="rgb(0, 0, 255)"
      data-testid="chart"
    />
  );
}

export function FullChart() {
  return (
    <Chart.Line
      data={MULTI_SERIES_DATA}
      series={[
        { key: 'incoming', label: 'Incoming' },
        { key: 'outgoing', label: 'Outgoing' },
      ]}
      xKey="date"
      height={250}
      grid
      tooltip
      data-testid="chart"
    />
  );
}

export function LinearCurve() {
  return (
    <Chart.Line
      data={SAMPLE_DATA}
      dataKey="value"
      height={170}
      curve="linear"
      data-testid="chart"
    />
  );
}

export function WithFadeLeft() {
  return (
    <Chart.Line
      data={SAMPLE_DATA}
      dataKey="value"
      height={170}
      fadeLeft
      data-testid="chart"
    />
  );
}

export function WithFadeLeftCustom() {
  return (
    <Chart.Line
      data={SAMPLE_DATA}
      dataKey="value"
      height={170}
      fadeLeft={60}
      data-testid="chart"
    />
  );
}

export function CustomAriaLabel() {
  return (
    <Chart.Line
      data={SAMPLE_DATA}
      dataKey="value"
      height={170}
      ariaLabel="Weekly revenue trend"
      data-testid="chart"
    />
  );
}

export function EmptyData() {
  return (
    <Chart.Line
      data={[]}
      dataKey="value"
      height={170}
      data-testid="chart"
    />
  );
}

export function SingleDataPoint() {
  return (
    <Chart.Line
      data={[{ date: 'Mon', value: 100 }]}
      dataKey="value"
      height={170}
      data-testid="chart"
    />
  );
}

export function NoAnimation() {
  return (
    <Chart.Line
      data={SAMPLE_DATA}
      dataKey="value"
      height={170}
      animate={false}
      data-testid="chart"
    />
  );
}

export function CustomStrokeWidth() {
  return (
    <Chart.Line
      data={SAMPLE_DATA}
      dataKey="value"
      height={170}
      strokeWidth={4}
      data-testid="chart"
    />
  );
}

export function WithFormatters() {
  return (
    <Chart.Line
      data={MULTI_SERIES_DATA}
      series={[
        { key: 'incoming', label: 'Incoming' },
        { key: 'outgoing', label: 'Outgoing' },
      ]}
      xKey="date"
      height={250}
      grid
      tooltip
      formatValue={(v) => `$${v}`}
      formatYLabel={(v) => `$${v}`}
      data-testid="chart"
    />
  );
}

export function SimpleTooltip() {
  return (
    <Chart.Line
      data={SAMPLE_DATA}
      dataKey="value"
      xKey="date"
      height={250}
      grid
      tooltip="simple"
      data-testid="chart"
    />
  );
}

export function DetailedTooltipExplicit() {
  return (
    <Chart.Line
      data={MULTI_SERIES_DATA}
      series={[
        { key: 'incoming', label: 'Incoming' },
        { key: 'outgoing', label: 'Outgoing' },
      ]}
      xKey="date"
      height={250}
      grid
      tooltip="detailed"
      data-testid="chart"
    />
  );
}

export function CustomTooltip() {
  return (
    <Chart.Line
      data={SAMPLE_DATA}
      dataKey="value"
      xKey="date"
      height={250}
      grid
      tooltip={(datum) => (
        <div data-testid="custom-tooltip-content">
          Custom: {String(datum.date)}
        </div>
      )}
      data-testid="chart"
    />
  );
}
