import { pool, withTransaction } from '../db/pool.js';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const openPositionSchema = z.object({
  userId: z.string().uuid(),
  symbol: z.string().default('BTC/USD'),
  direction: z.enum(['long', 'short']),
  leverage: z.number().min(1).max(1000),
  margin: z.number().positive(),
  currentPrice: z.number().positive(), // Provided by client or fetched
});

export class TradingService {
  // Simulate price movement for the game (can be replaced with real API)
  generatePrice(basePrice: number) {
    const change = (Math.random() - 0.5) * 0.02; // +/- 1% volatility
    return basePrice * (1 + change);
  }

  async openPosition(input: z.infer<typeof openPositionSchema>) {
    const data = openPositionSchema.parse(input);
    const size = data.margin * data.leverage;
    
    // Calculate liquidation price
    // Long: entry * (1 - 1/leverage)
    // Short: entry * (1 + 1/leverage)
    const liquidationPrice = data.direction === 'long'
      ? data.currentPrice * (1 - (1 / data.leverage))
      : data.currentPrice * (1 + (1 / data.leverage));

    return withTransaction(async (client) => {
      // Check wallet balance (using deposit_wallet for trading)
      const walletRes = await client.query(
        `select deposit_wallet from wallets where user_id = $1 for update`,
        [data.userId]
      );
      
      const balance = parseFloat(walletRes.rows[0]?.deposit_wallet || '0');
      if (balance < data.margin) {
        throw new Error('Insufficient balance');
      }

      // Deduct margin from wallet
      await client.query(
        `update wallets set deposit_wallet = deposit_wallet - $1 where user_id = $2`,
        [data.margin, data.userId]
      );

      // Create position
      const res = await client.query(
        `insert into trading_positions (
          user_id, symbol, direction, entry_price, leverage, margin, size, liquidation_price, status
        ) values ($1, $2, $3, $4, $5, $6, $7, $8, 'open') returning *`,
        [
          data.userId,
          data.symbol,
          data.direction,
          data.currentPrice,
          data.leverage,
          data.margin,
          size,
          liquidationPrice
        ]
      );

      return res.rows[0];
    });
  }

  async closePosition(userId: string, positionId: string, currentPrice: number) {
    return withTransaction(async (client) => {
      const posRes = await client.query(
        `select * from trading_positions where id = $1 and user_id = $2 and status = 'open' for update`,
        [positionId, userId]
      );
      const position = posRes.rows[0];
      if (!position) throw new Error('Position not found or already closed');

      // Calculate PnL
      // Long: (exit - entry) * size / entry
      // Short: (entry - exit) * size / entry
      let pnl = 0;
      const entry = parseFloat(position.entry_price);
      const size = parseFloat(position.size);
      const margin = parseFloat(position.margin);

      if (position.direction === 'long') {
        pnl = ((currentPrice - entry) / entry) * size;
      } else {
        pnl = ((entry - currentPrice) / entry) * size;
      }

      // Check for liquidation condition (if PnL <= -margin)
      if (pnl <= -margin) {
        // Liquidated!
        await client.query(
          `update trading_positions set status = 'liquidated', closed_at = now() where id = $1`,
          [positionId]
        );
        return { status: 'liquidated', pnl: -margin, returnAmount: 0 };
      }

      const pnlPercent = (pnl / margin) * 100;
      const returnAmount = margin + pnl;

      // Update position status
      await client.query(
        `update trading_positions set status = 'closed', closed_at = now() where id = $1`,
        [positionId]
      );

      // Add to history
      await client.query(
        `insert into trading_history (
          user_id, position_id, symbol, direction, entry_price, exit_price, leverage, margin, pnl, pnl_percent
        ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          userId,
          positionId,
          position.symbol,
          position.direction,
          entry,
          currentPrice,
          position.leverage,
          margin,
          pnl,
          pnlPercent
        ]
      );

      // Return margin + PnL to wallet
      if (returnAmount > 0) {
        await client.query(
          `update wallets set deposit_wallet = deposit_wallet + $1 where user_id = $2`,
          [returnAmount, userId]
        );
      }

      return { status: 'closed', pnl, pnlPercent, returnAmount };
    });
  }

  async getPositions(userId: string) {
    const res = await pool.query(
      `select * from trading_positions where user_id = $1 and status = 'open' order by opened_at desc`,
      [userId]
    );
    return res.rows;
  }
}