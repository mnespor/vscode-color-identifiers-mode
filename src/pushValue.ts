
export function pushValue<Element>(dictionary: Record<string, Element[]>, key: string, value: Element) {
	if (dictionary.hasOwnProperty(key)) {
		dictionary[key].push(value)
	} else {
		dictionary[key] = [value]
	}
}
