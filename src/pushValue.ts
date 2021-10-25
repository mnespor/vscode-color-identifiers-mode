
export function pushValue<Element>(dictionary: Record<string, Element[]>, key: string, value: Element) {
	// use Object.prototype.hasOwnProperty.call instead of dictionary.hasOwnProperty incase dictionary["hasOwnProperty"] was replaced
	if (Object.prototype.hasOwnProperty.call(dictionary, key)) {
		dictionary[key].push(value)
	} else {
		dictionary[key] = [value]
	}
}
