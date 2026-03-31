import { supabase } from './supabase';

export const goalsDB = {
  async getAll() {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data.map(fromDB);
  },

  async save(goal) {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('goals')
      .upsert({ ...toDB(goal), user_id: user.id });
    if (error) throw error;
  },

  async delete(id) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

export const entriesDB = {
  async getAll() {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('ts', { ascending: true });
    if (error) throw error;
    return data.map(entryFromDB);
  },

  async save(entry) {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('entries')
      .upsert({
        id: entry.id,
        user_id: user.id,
        goal_id: entry.goalId,
        amount: entry.amount,
        unit: entry.unit,
        date: entry.date,
        ts: entry.ts,
        note: entry.note || '',
      });
    if (error) throw error;
  },

  async delete(id) {
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

function toDB(goal) {
  return {
    id: goal.id,
    name: goal.name,
    icon: goal.icon,
    type: goal.type,
    unit: goal.unit,
    target: goal.target,
    period: goal.period,
    nudge: goal.nudge,
    quick_amounts: goal.quickAmounts,
    color: goal.color,
    mastery_tracking: goal.masteryTracking || false,
    active: goal.active !== false,
    created_at: goal.createdAt,
  };
}

function fromDB(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    icon: row.icon,
    type: row.type,
    unit: row.unit,
    target: row.target,
    period: row.period,
    nudge: row.nudge,
    quickAmounts: row.quick_amounts,
    color: row.color,
    masteryTracking: row.mastery_tracking,
    active: row.active,
    createdAt: row.created_at,
  };
}

function entryFromDB(row) {
  return {
    id: row.id,
    goalId: row.goal_id,
    amount: row.amount,
    unit: row.unit,
    date: row.date,
    ts: row.ts,
    note: row.note,
  };
}

export async function seedIfEmpty() {
  return;
}
