
export function pushValue<Element>(dictionary: Record<string, Element[]>, key: string, value: Element) {
	if (key in dictionary) {
		dictionary[key].push(value);
	} else {
		dictionary[key] = [value];
	}
}
