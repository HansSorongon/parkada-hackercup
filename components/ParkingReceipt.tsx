import React from 'react';
import {
  DataTable,
  Dot,
  Line,
  Paper,
  RowText,
  TableCell,
  TableHead,
  TableRow,
  Text,
} from "react-receipt-slip";

interface ParkingReceiptProps {
  sessionData: {
    id: string;
    parkingSpotName: string;
    parkingSpotAddress: string;
    userName: string;
    userEmail: string;
    vehiclePlate: string;
    vehicleModel: string;
    startTime: string;
    endTime: string;
    duration: number; // in hours
    hourlyRate: number;
    totalCost: number;
    paymentMethod: string;
  };
}

const ParkingReceipt: React.FC<ParkingReceiptProps> = ({ sessionData }) => {
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-PH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toFixed(2)}`;
  };

  const calculateMinimumBilling = () => {
    // Minimum 1 hour billing even if parked for less
    const billedHours = Math.max(1, Math.ceil(sessionData.duration));
    const baseCost = sessionData.hourlyRate;
    const actualCost = billedHours * sessionData.hourlyRate;
    
    return {
      billedHours,
      baseCost,
      actualCost: Math.max(baseCost, actualCost)
    };
  };

  const billing = calculateMinimumBilling();
  const receiptNumber = `PK${sessionData.id.slice(-8).toUpperCase()}`;
  const currentDate = new Date().toISOString();

  return (
    <Paper>
      <Text align='center' bold>PARKADA</Text>
      <Text align='center'>Smart Parking Solutions</Text>
      <Text align='center'>Philippines, Metro Manila</Text>
      <Text align='center'>TIN: 999-999-999-999</Text>
      <Text align='center'>Contact: support@parkada.com</Text>
      <Text align='center'>Date Issued: {formatDateTime(currentDate)}</Text>
      
      <Dot vmar={[10, 10]} />
      
      <DataTable>
        <tbody>
          <TableRow>
            <TableCell><Text bold>PARKING RECEIPT</Text></TableCell>
            <TableCell><Text align='right'>#{receiptNumber}</Text></TableCell>
          </TableRow>
          <TableRow>
            <TableCell><Text bold>Location</Text></TableCell>
            <TableCell><Text align='right'>{sessionData.parkingSpotName}</Text></TableCell>
          </TableRow>
        </tbody>
      </DataTable>

      <Dot vmar={[5, 5]} />

      <DataTable>
        <tbody>
          <TableRow>
            <TableCell><Text bold>Customer:</Text></TableCell>
            <TableCell><Text align='right'>{sessionData.userName}</Text></TableCell>
          </TableRow>
          <TableRow>
            <TableCell><Text bold>Email:</Text></TableCell>
            <TableCell><Text align='right'>{sessionData.userEmail}</Text></TableCell>
          </TableRow>
          <TableRow>
            <TableCell><Text bold>Vehicle:</Text></TableCell>
            <TableCell><Text align='right'>{sessionData.vehiclePlate}</Text></TableCell>
          </TableRow>
          <TableRow>
            <TableCell><Text bold>Model:</Text></TableCell>
            <TableCell><Text align='right'>{sessionData.vehicleModel}</Text></TableCell>
          </TableRow>
        </tbody>
      </DataTable>

      <Dot vmar={[10, 10]} />

      <DataTable>
        <thead>
          <TableRow>
            <TableHead align='left'>PARKING DETAILS</TableHead>
            <TableHead align='center'>TIME</TableHead>
            <TableHead align='right'>RATE</TableHead>
            <TableHead align='right'>AMOUNT</TableHead>
          </TableRow>
        </thead>
        <tbody>
          <TableRow>
            <TableCell>Parking Service</TableCell>
            <TableCell align='center'>{billing.billedHours}h</TableCell>
            <TableCell align='right'>{formatCurrency(sessionData.hourlyRate)}/hr</TableCell>
            <TableCell align='right'>{formatCurrency(billing.actualCost)}</TableCell>
          </TableRow>
        </tbody>
      </DataTable>

      <Dot vmar={[5, 5]} />

      <DataTable>
        <tbody>
          <TableRow>
            <TableCell><Text bold>Start Time:</Text></TableCell>
            <TableCell><Text align='right'>{formatDateTime(sessionData.startTime)}</Text></TableCell>
          </TableRow>
          <TableRow>
            <TableCell><Text bold>End Time:</Text></TableCell>
            <TableCell><Text align='right'>{formatDateTime(sessionData.endTime)}</Text></TableCell>
          </TableRow>
          <TableRow>
            <TableCell><Text bold>Duration:</Text></TableCell>
            <TableCell><Text align='right'>{sessionData.duration.toFixed(2)} hours</Text></TableCell>
          </TableRow>
          {sessionData.duration < 1 && (
            <TableRow>
              <TableCell><Text bold>Min. Billing:</Text></TableCell>
              <TableCell><Text align='right'>1 hour</Text></TableCell>
            </TableRow>
          )}
        </tbody>
      </DataTable>

      <Dot vmar={[10, 10]} />

      <RowText>
        <Text bold>SUBTOTAL</Text>
        <Text bold>{formatCurrency(billing.actualCost)}</Text>
      </RowText>

      <DataTable>
        <tbody>
          <TableRow>
            <TableCell><Text bold>VAT (12%)</Text></TableCell>
            <TableCell><Text align='right'>{formatCurrency(billing.actualCost * 0.12)}</Text></TableCell>
          </TableRow>
          <TableRow>
            <TableCell><Text bold>TOTAL AMOUNT</Text></TableCell>
            <TableCell><Text align='right' bold>{formatCurrency(billing.actualCost * 1.12)}</Text></TableCell>
          </TableRow>
        </tbody>
      </DataTable>

      <Dot vmar={[10, 10]} />

      <DataTable>
        <tbody>
          <TableRow>
            <TableCell><Text bold>PAYMENT METHOD</Text></TableCell>
            <TableCell><Text align='right'>{sessionData.paymentMethod}</Text></TableCell>
          </TableRow>
          <TableRow>
            <TableCell><Text bold>AMOUNT PAID</Text></TableCell>
            <TableCell><Text align='right'>{formatCurrency(billing.actualCost * 1.12)}</Text></TableCell>
          </TableRow>
          <TableRow>
            <TableCell><Text bold>CHANGE</Text></TableCell>
            <TableCell><Text align='right'>₱0.00</Text></TableCell>
          </TableRow>
        </tbody>
      </DataTable>

      <Dot vmar={[10, 10]} />

      <Text bold>Receipt No.: {receiptNumber}</Text>
      <Text bold>Session ID: {sessionData.id}</Text>
      <Text bold>Date & Time: {formatDateTime(currentDate)}</Text>

      <Dot vmar={[15, 15]} />

      <RowText valign='bottom'>
        <Text>Customer Signature: </Text>
        <Line />
      </RowText>

      <Dot vmar={[20, 10]} />

      <Text align='center' bold>**Thank you for parking with Parkada!**</Text>
      <Text align='center'>Drive safe and have a great day!</Text>
      
      <Dot vmar={[10, 10]} />
      
      <Text align='center'>For support: support@parkada.com</Text>
      <Text align='center'>Visit us at: www.parkada.com</Text>
      
      <Dot vmar={[5, 5]} />
      
      <Text align='center'>Please keep this receipt for your records.</Text>
      
      <Dot vmar={[0, 0]} />
    </Paper>
  );
};

export default ParkingReceipt;