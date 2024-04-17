import React, { FormEventHandler, useEffect, useState } from 'react';

import { 
    useDisclosure,
    Modal, ModalOverlay, ModalContent, 
    Button, Box,
    Input, NumberInput, NumberInputField, Switch, InputGroup, InputLeftAddon, InputRightAddon,
    FormControl, FormLabel, FormHelperText,
    Slider, SliderMark, SliderTrack, SliderFilledTrack, SliderThumb,
    SimpleGrid,
} from '@chakra-ui/react';
import { storage } from 'webextension-polyfill';

interface IMap<T> {
    [key: string]: T | any;
}

const LOCAL_STORAGE_KEY = 'me_game_defs';

export async function setData(id: string, data: Object) {
    const store = storage.local.get(LOCAL_STORAGE_KEY) as IMap<string>;
    const newData = {[id]: data};
    let oldData = {};

    if(store.hasOwnProperty(LOCAL_STORAGE_KEY)) {
        oldData = JSON.parse(store[LOCAL_STORAGE_KEY])
    }

    const mergedData = {...oldData, ...newData};

    storage.local.set({'me_game_definition': JSON.stringify(mergedData)}).then(
        _ => console.log("OK")
    )
}

export async function getAllSavedData() {
    const store = storage.local.get(LOCAL_STORAGE_KEY) as IMap<string>;
    let data = {};

    if(store.hasOwnProperty(LOCAL_STORAGE_KEY)) {
        data = JSON.parse(store[LOCAL_STORAGE_KEY])
    }

    return data;
}

export function DialogContent() {
    const [playerNum, setPlayerNum] = useState(5);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        storage.local.get('me_game_definition').then(x => {
            console.log(x)
        })

        storage.local.get('me_game_definition_not_there').then(x => {
            console.log(x)
        })
    }, [])

    const smStyle = {
        mt: '-10',
        ml: '-6',
        color: 'white',
        bg: 'blue.500',
        // textAlign: 'center',
        w: "12"
    }

    const handleSave: FormEventHandler<any> = (e) => {
        e.preventDefault();

        const d = new FormData(e.currentTarget);
        console.dir(d)

        const start = d.get('start');
        const end = d.get('end')
        const players = d.getAll('players');

        const map: IMap<string[]> = {};
        [...d.keys()].forEach(k => {
            if(k.startsWith('alias')) {
                const u = k.split('-')[1];
                const value = d.get(k) as string;
                map[u] = value.split(',').map(x => x.trim())
            }
        })

        const gameDef = {
            start,
            end,
            players,
            aliases: map
        }

        storage.local.set({'me_game_definition': JSON.stringify(gameDef)}).then(
            _ => console.log("OK")
        )
    }

    return (
        <div>
        <Button onClick={onOpen}>Configure Settings</Button>
        <Modal id="me-config-modal" isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
            <form id="setting" onSubmit={handleSave}>
                <h2>Game Setting</h2>
                <h4>General</h4>
                <SimpleGrid columns={2} spacing={5}>
                <InputGroup>
                    <FormLabel minW='60px'>Start At</FormLabel>
                    <NumberInput name="start"><NumberInputField /></NumberInput>
                </InputGroup>
                <InputGroup>
                    <FormLabel minW='60px'>End At</FormLabel>
                    <NumberInput name='end'><NumberInputField /></NumberInput>
                </InputGroup>
                </SimpleGrid>

                <h4>Players</h4>
                <Box p={5} pt={10}>
                    <Slider aria-label='playerNum' defaultValue={playerNum} min={1} max={25} step={1} onChange={(value) => setPlayerNum(value)}>
                        {/* <SliderMark value={9} {...smStyle}>9</SliderMark> */}
                        <SliderMark value={1} mt='2' ml='-1'>1</SliderMark>
                        <SliderMark value={13} mt='2' ml='-2'>13</SliderMark>
                        <SliderMark value={25} mt='2' ml='-3'>25</SliderMark>
                        {/* <SliderMark value={17} {...smStyle}>17</SliderMark> */}
                        <SliderMark value={playerNum} {...smStyle} textAlign='center'>{playerNum}</SliderMark>
                        <SliderTrack><SliderFilledTrack /></SliderTrack>
                        <SliderThumb />
                    </Slider>
                </Box>
                <p>Click the switch to enable Aliases & Replacements for a player slot</p>
                {[...Array(playerNum)].map((_, i) => <PlayerBox i={i} key={i} />)}

                <Button type="submit" form="setting">Save</Button>
            </form>
            </ModalContent>
        </Modal>
        </div>
    )
}

function PlayerBox(props: {i: number}) {
    const {i} = props;

    const [value, setValue] = useState('');
    const handleChange = (e: any) => setValue(e.target.value);
    const [useAlias, setUseAlias] = useState(false);
    const [aliases, setAliases] = useState([]);

    const handleCheck = (e: any) => {
        setUseAlias(e.target.checked)
    }

    return <FormControl>
        <InputGroup>
            <InputLeftAddon minW='60px'>{i+1}.</InputLeftAddon>
            <Input type='text' name='players' onChange={handleChange} value={value} placeholder='enter username' />
            <InputRightAddon>
                <Switch size='sm' onChange={handleCheck} />
            </InputRightAddon>
        </InputGroup>
        {useAlias && 
        <FormControl>
            <Input type='text' name={`alias-${value}`} />
            <FormHelperText>Enter multiple values separated with a comma ","</FormHelperText>
        </FormControl>
        }
        {/* <Button aria-label='add-alias'>Add Replacement</Button> */}
    </FormControl>
}