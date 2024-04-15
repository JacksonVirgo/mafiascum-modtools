import React, { useState } from 'react';
import { Modal, Button, Form, InputGroup, Tab, Tabs, FormControl } from 'react-bootstrap';
import { storage } from 'webextension-polyfill';

interface IMap<T, P> {
    [any: string]: string
}

interface IASProps {
    count: number,
    formName: string,
    data: IMap<string, string>
}


function Players(props: any) {
    const { count, formName, handleChange } = props;

    const handleInputChange = (e: any, i: number) => {
        handleChange((prev: any) => {
            return {
                ...prev,
                [i]: (e.target as HTMLInputElement).value
            }
        })
    }

    return new Array(count).fill(0).map((x, i) => (
        <InputGroup key={i}>
            <InputGroup.Text style={{textAlign: 'left', minWidth: '50px'}}>{i+1}.</InputGroup.Text>
            <Form.Control as='input' name={formName} placeholder="Enter username" onChange={e => handleInputChange(e, i)} required></Form.Control>
        </InputGroup>
    ))
}

function Replacements(props: IASProps) {
    const { count, formName, data = {} } = props;

    return new Array(count).fill(0).map((x, i) => (
        <InputGroup key={i}>
            <InputGroup.Text style={{textAlign: 'left', minWidth: '50px'}}>{i+1}.</InputGroup.Text>
            <Form.Select aria-label='aliase' id="replaced" name={formName} defaultValue=""
                required
            >
                <option value="" disabled hidden>Select username</option>
                {Object.values(data).map(x => <option key={x} value={x}>{x}</option>)}
            </Form.Select>
            <Form.Control as='input' name={formName} placeholder="Replaced out"></Form.Control>
        </InputGroup>
    ))
}

function Aliases(props: IASProps) {
    const { count, formName, data = {} } = props;

    return new Array(count).fill(0).map((x, i) => (
        <InputGroup key={i}>
            <InputGroup.Text style={{textAlign: 'left', minWidth: '50px'}}>{i+1}.</InputGroup.Text>
            <Form.Select aria-label='aliase' id="aliases" name={formName} defaultValue=""
                required
            >
                <option value="" disabled hidden>Select username</option>
                {Object.values(data).map(x => <option key={x} value={x}>{x}</option>)}
            </Form.Select>
            <Form.Control as='input' name={formName} placeholder="Alias"></Form.Control>
        </InputGroup>
    ))
}




export function DialogContent() {
    const [show, setShow] = useState(false);
    const [players, setPlayers] = useState({});
    const [playerNum, setPlayerNum] = useState(5);
    const [replacements, setReplacements] = useState(0);
    const [aliases, setAliases] = useState(0);

    const handleAdd = () => {
        setPlayerNum(prev => prev + 1)
    }

    const handleDel = () => {
        setPlayerNum(prev => Math.max(prev - 1, 1))
    }

    const handleAddR = () => {
        setReplacements(prev => prev + 1)
    }

    const handleDelR = () => {
        setReplacements(prev => Math.max(prev - 1, 0))
    }

    const handleAddA = () => {
        setAliases(prev => prev + 1)
    }

    const handleDelA = () => {
        setAliases(prev => Math.max(prev - 1, 0))
    }

    const handleSave = (e: any) => {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);

        console.log(formData.getAll("players"))

        /**
            players: string[],
            aliases: map<string, string[]>,
            replacements: map<string, string[]>,
            startAt: number,
            endAt: number
        */

        const startAt = formData.get("startAt");
        const endAt = formData.get("endAt");
        const players = formData.getAll("players");
        const replacements = formData.getAll("replacements");
        const aliases = formData.getAll("aliases");

        console.log(players)
        console.log(replacements)
        console.log(aliases)

    }

    return (
        <div style={{color: 'black'}}>
        <Button variant="me-primary" onClick={() => setShow(true)}>Configure Settings</Button>
        <Modal id="me-config-modal" show={show} onHide={() => setShow(false)}>
            <h2>Game Setting</h2>
            <Form onSubmit={handleSave}>
                <Tabs defaultActiveKey="general">
                    <Tab eventKey="general" title="General">
                        <Form.Group id="group-1">
                            <Form.Label style={{color: 'black'}}>Starting from Post #</Form.Label>
                            <Form.Control type="number" name="startAt" />
                            <Form.Label style={{color: 'black'}}>End at Post #</Form.Label>
                            <Form.Control type="number" name="endAt" />
                        </Form.Group>
                    </Tab>
                    <Tab eventKey="players" title="Players">
                        <Form.Group id="group-2" className='divider'>
                            <Form.Label style={{color: 'black'}}>Add players</Form.Label>
                            <div className='btn-control-proj'>
                                <Button variant="outline-form" onClick={handleAdd}>+ Add</Button>
                                <Button variant="outline-form" onClick={handleDel} disabled={playerNum <= 1}>- Remove</Button>
                            </div>
                            {/* @ts-expect-error Server Component */}
                            <Players count={playerNum} formName='players' handleChange={setPlayers} />
                        </Form.Group>
                    </Tab>
                    <Tab eventKey="misc" title="Additional Settings">
                        <Form.Group id="group-3">
                            <Form.Label style={{color: 'black'}}>Replacements</Form.Label>
                            <div className='btn-control-proj'>
                                <Button variant="outline-form" onClick={handleAddR}>+ Add</Button>
                                <Button variant="outline-form" onClick={handleDelR} disabled={replacements <= 0}>- Remove</Button>
                            </div>
                            {/* @ts-expect-error Server Component */}
                            <Replacements count={replacements} formName='replacements' data={players} />
                            <Form.Label style={{color: 'black'}}>Aliases</Form.Label>
                            <div className='btn-control-proj'>
                                <Button variant="outline-form" onClick={handleAddA}>+ Add</Button>
                                <Button variant="outline-form" onClick={handleDelA} disabled={aliases <= 0}>- Remove</Button>
                            </div>
                            {/* @ts-expect-error Server Component */}
                            <Aliases count={aliases} formName='aliases' data={players} />
                        </Form.Group>
                    </Tab>
                </Tabs>
                <Button variant="me-primary" type="submit">Save</Button>
            </Form>
        </Modal>
        </div>
    )
}