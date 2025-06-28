/* Ű���� ���� & ��ó */
export function buildKeywords(title) {
    const parts = title.split(/[ \-!@#$%^&*()_+=[\]{}|\\;:'",./?><]/).filter(Boolean);
    const tokens = parts.flatMap(p => (p.length > 2 ? [p, p.slice(0, 2)] : [p]));
    const regex = new RegExp(tokens.join('.*'), 'i');
    return { tokens, regex };
}

/* �Խñ� �� ���ü� ���� ������ Ŭ���� ��ȯ */
export function buildMatcher(title) {
    const { regex } = buildKeywords(title);
    return post => regex.test(post.title) || regex.test(post.content ?? '');
}

/* �̺�Ʈ ���� ��� �⺻ ī�װ� ��õ */
export function suggestCategories(title) {
    const mapping = {
        '�⼮|�α���': '�⼮üũ',
        '����|����': '���� ����',
        '�̴ϰ���|����': '�̴ϰ���'
    };
    return Object
        .entries(mapping)
        .filter(([re]) => new RegExp(re, 'i').test(title))
        .map(([, cat]) => cat);
}
