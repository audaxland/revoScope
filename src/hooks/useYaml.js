import {useEffect, useState} from "react";
import yaml from 'yaml'

/**
 * Reads a yaml file and returns the content as a javascript object
 * @param url {string} path to the yaml file
 * @param defaultValue {any} value to return while the yaml file is not yet loaded and parsed.
 * @returns {{}}
 */
const useYaml = (url, defaultValue = {}) => {
    /**
     * @type {[any, function]}} state of the parsed content of the yaml file
     */
    const [content, setContent] = useState(defaultValue)

    useEffect(() => {
        if (!url) return;
        (async () => {
            try {
                const fileContent = await fetch(url).then(res => res.text());
                setContent(yaml.parse(fileContent));
            } catch (error) {
                console.log(error);
            }
        })()
    }, [url])

    return content;
}

export default useYaml
