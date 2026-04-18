import {
  addShoppingItem,
  listShoppingItems,
  removeShoppingItem,
  clearShoppingList,
} from '../storage';

export function handleShopping(chatId: string, args: string): string {
  const trimmed = args.trim();
  if (!trimmed) {
    return showList(chatId);
  }

  const firstSpace = trimmed.indexOf(' ');
  const subcommand = firstSpace === -1 ? trimmed : trimmed.slice(0, firstSpace);
  const rest = firstSpace === -1 ? '' : trimmed.slice(firstSpace + 1).trim();

  switch (subcommand) {
    case 'הוסף':
    case 'add':
      return addItem(chatId, rest);
    case 'מחק':
    case 'הסר':
    case 'remove':
    case 'rm':
      return removeItem(chatId, rest);
    case 'נקה':
    case 'clear':
      clearShoppingList(chatId);
      return '🗑️ רשימת הקניות נמחקה.';
    default:
      return addItem(chatId, trimmed);
  }
}

function addItem(chatId: string, text: string): string {
  const name = text.trim();
  if (!name) return 'מה להוסיף? לדוגמה: !קניות הוסף חלב';
  addShoppingItem(chatId, name);
  const count = listShoppingItems(chatId).length;
  return `✅ הוספתי "${name}" (${count} פריטים ברשימה).`;
}

function removeItem(chatId: string, text: string): string {
  const target = text.trim();
  if (!target) return 'מה למחוק? לדוגמה: !קניות מחק חלב';

  const items = listShoppingItems(chatId);
  const idx = items.findIndex((it) => it.toLowerCase() === target.toLowerCase());
  if (idx === -1) {
    const partial = items.findIndex((it) => it.toLowerCase().includes(target.toLowerCase()));
    if (partial === -1) return `🤷 לא מצאתי "${target}" ברשימה.`;
    const removed = items[partial];
    removeShoppingItem(chatId, partial);
    return `✅ הסרתי "${removed}".`;
  }
  removeShoppingItem(chatId, idx);
  return `✅ הסרתי "${target}".`;
}

function showList(chatId: string): string {
  const items = listShoppingItems(chatId);
  if (items.length === 0) {
    return '🛒 הרשימה ריקה. הוסיפו עם: !קניות הוסף <פריט>';
  }
  const lines = items.map((it, i) => `${i + 1}. ${it}`).join('\n');
  return `🛒 *רשימת קניות* (${items.length} פריטים)\n${lines}\n\nלהסרה: !קניות מחק <פריט>\nלמחיקה מלאה: !קניות נקה`;
}
