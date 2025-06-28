/* 키워드 빌더 & 매처 */
export function buildKeywords(title) {
    const parts = title.split(/[ \-!@#$%^&*()_+=[\]{}|\\;:'",./?><]/).filter(Boolean);
    const tokens = parts.flatMap(p => (p.length > 2 ? [p, p.slice(0, 2)] : [p]));
    const regex = new RegExp(tokens.join('.*'), 'i');
    return { tokens, regex };
}

/* 게시글 → 관련성 여부 판정용 클로저 반환 */
export function buildMatcher(title) {
    const { regex } = buildKeywords(title);
    return post => regex.test(post.title) || regex.test(post.content ?? '');
}

/* 이벤트 제목 기반 기본 카테고리 추천 */
export function suggestCategories(title) {
    const mapping = {
        '출석|로그인': '출석체크',
        '할인|상점': '상점 할인',
        '미니게임|게임': '미니게임'
    };
    return Object
        .entries(mapping)
        .filter(([re]) => new RegExp(re, 'i').test(title))
        .map(([, cat]) => cat);
}
