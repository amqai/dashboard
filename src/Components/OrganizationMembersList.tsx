import React from 'react';
import { Member } from '../models/Organization';
import { PiCrownDuotone } from 'react-icons/pi';

interface FeatureModalProps {
    organizationMembers: Member[] | undefined;
    organizationOwner: string | undefined,
}
  
const OrganizationMembersModal: React.FC<FeatureModalProps> = ({ organizationMembers, organizationOwner }) => {
    return (
        <>
            {organizationMembers && organizationMembers.length > 0 ? (
                <div>
                    {organizationMembers.map((member, index) => (
                        <div key={index}>
                            <p>
                                {member.personId === organizationOwner && ( <PiCrownDuotone style={{marginRight:"1rem"}} title="Organization Owner" /> ) }
                                {member.email}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No members found</p>
            )}
        </>
    );
};

export default OrganizationMembersModal;
