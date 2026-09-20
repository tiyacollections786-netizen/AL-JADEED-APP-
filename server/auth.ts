import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../src/types';
import { db } from './db';
import { getSupabaseServerClient } from './cloudDb';

const JWT_SECRET = process.env.JWT_SECRET || 'meta_eggs_jwt_secret_key_2026_super_secure';

export interface AuthRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ error: 'Authentication token required' });
    return;
  }

  // 1. Supabase Auth as the primary single source of truth
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser(token);
      if (!authError && authData?.user) {
        const suUser = authData.user;
        let dbUser = db.getUserById(suUser.id);

        let profile: any = null;
        try {
          const { data: p } = await supabase
            .from('users')
            .select('*')
            .eq('id', suUser.id)
            .maybeSingle();
          profile = p;
        } catch {
          // ignore error if table is not yet queryable
        }

        const metadata = suUser.user_metadata || {};
        const appMetadata = suUser.app_metadata || {};
        const email = (suUser.email || profile?.email || dbUser?.email || '').toLowerCase().trim();

        // Protected Admin Role Resolution: Never trust user_metadata for admin rights
        const isAdmin =
          profile?.role === 'admin' ||
          appMetadata?.role === 'admin' ||
          email === 'admin@metaeggs.com' ||
          (dbUser?.role === 'admin' && email === 'admin@metaeggs.com');
        const role = isAdmin ? 'admin' : 'customer';

        const status = (profile?.status || dbUser?.status || 'active') as 'active' | 'suspended';
        if (status === 'suspended') {
          res.status(403).json({ error: 'Account has been suspended. Please contact support.' });
          return;
        }

        const resolvedUser: User = {
          id: suUser.id,
          name: profile?.name || metadata.name || dbUser?.name || email.split('@')[0] || 'User',
          email,
          phone: profile?.phone || metadata.phone || dbUser?.phone || '',
          role,
          balance: Number(profile?.balance ?? dbUser?.balance ?? 0),
          referralCode:
            profile?.referral_code ||
            metadata.referral_code ||
            dbUser?.referralCode ||
            `AJME-${suUser.id.substring(0, 5).toUpperCase()}`,
          status,
          bankDetails: profile?.bank_details || dbUser?.bankDetails,
          createdAt: suUser.created_at || dbUser?.createdAt || new Date().toISOString(),
          updatedAt: profile?.updated_at || dbUser?.updatedAt || new Date().toISOString(),
        };

        // Cache in local db for relational helpers (hens, orders, balances)
        if (!dbUser) {
          db.createUser({
            ...resolvedUser,
            passwordHash: '',
          });
        } else {
          db.updateUser(suUser.id, {
            name: resolvedUser.name,
            email: resolvedUser.email,
            phone: resolvedUser.phone,
            role: resolvedUser.role,
            status: resolvedUser.status,
          });
        }

        req.user = resolvedUser;
        next();
        return;
      }
    } catch (sbErr) {
      console.warn('[Supabase Auth Server Check]', sbErr);
    }
  }

  // 2. Fallback to local JWT verify (for admin portal token)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    const user = db.getUserById(decoded.id);

    if (!user) {
      res.status(401).json({ error: 'User account no longer exists' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ error: 'Account has been suspended. Please contact support.' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired session token' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied: Admin privileges required' });
    return;
  }
  next();
}
